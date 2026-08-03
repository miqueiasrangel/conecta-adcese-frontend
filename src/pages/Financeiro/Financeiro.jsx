import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import '../Secretaria/Secretaria.css';
import './Financeiro.css';

import NavbarHeader from '../../components/NavbarHeader/NavbarHeader';
import ActionMenu from '../../components/ActionMenu/ActionMenu';
import { FaTrashAlt } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';

function Financeiro() {
  const { showToast, showConfirm } = useToast();
  const dataAtual = new Date();

  // HOOKS DE ESTADO (DECLARADOS NO INÍCIO)
  const [lancamentos, setLancamentos] = useState([]);
  const [congregacoes, setCongregacoes] = useState([]);
  const [membros, setMembros] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalRelatorioAberto, setModalRelatorioAberto] = useState(false);

  // ESTADOS DE FILTRO E EXIBIÇÃO
  const [buscaTexto, setBuscaTexto] = useState('');
  const [congregacaoFiltro, setCongregacaoFiltro] = useState('TODAS');
  const [mesFiltro, setMesFiltro] = useState(String(dataAtual.getMonth() + 1));
  const [anoFiltro, setAnoFiltro] = useState(String(dataAtual.getFullYear()));
  const [abaAtiva, setAbaAtiva] = useState('TODOS'); // 'TODOS', 'ENTRADAS', 'SAIDAS', 'DIZIMOS'
  const [modoVisualizacao, setModoVisualizacao] = useState('DETALHADO'); // 'DETALHADO' ou 'GERAL'

  // FORMULÁRIO DE LANÇAMENTO
  const itemInicialEntrada = {
    categoria: 'Dízimos',
    valor: '',
    formaPagamento: 'Dinheiro',
    membroId: '',
    descricao: ''
  };

  const [tipoForm, setTipoForm] = useState('ENTRADA');
  const [dataForm, setDataForm] = useState(new Date().toISOString().split('T')[0]);
  const [congregacaoIdForm, setCongregacaoIdForm] = useState('');
  const [itensEntrada, setItensEntrada] = useState([itemInicialEntrada]);
  const [formSaida, setFormSaida] = useState({
    descricao: '',
    destinatario: '',
    categoria: 'Manutenção',
    formaPagamento: 'Pix',
    valor: ''
  });

  const mesesNomes = [
    { valor: '1', nome: 'Janeiro' },
    { valor: '2', nome: 'Fevereiro' },
    { valor: '3', nome: 'Março' },
    { valor: '4', nome: 'Abril' },
    { valor: '5', nome: 'Maio' },
    { valor: '6', nome: 'Junho' },
    { valor: '7', nome: 'Julho' },
    { valor: '8', nome: 'Agosto' },
    { valor: '9', nome: 'Setembro' },
    { valor: '10', nome: 'Outubro' },
    { valor: '11', nome: 'Novembro' },
    { valor: '12', nome: 'Dezembro' }
  ];

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    carregarDados();
  }, [navigate]);

  const carregarDados = () => {
    api.get('/lancamentos')
      .then(res => {
        const dados = Array.isArray(res.data) ? res.data : (res.data?.content || []);
        setLancamentos(dados);
      })
      .catch(err => {
        console.error("Erro ao carregar lançamentos:", err);
        setLancamentos([]);
      });

    api.get('/congregacoes')
      .then(res => {
        const dados = Array.isArray(res.data) ? res.data : (res.data?.content || []);
        setCongregacoes(dados);
      })
      .catch(err => {
        console.error("Erro ao carregar congregações:", err);
        setCongregacoes([]);
      });

    api.get('/membros')
      .then(res => {
        const dados = Array.isArray(res.data) ? res.data : (res.data?.content || []);
        setMembros(dados);
      })
      .catch(err => {
        console.error("Erro ao carregar membros:", err);
        setMembros([]);
      });
  };

  const adicionarItemEntrada = () => {
    setItensEntrada(prevItens => [...prevItens, { ...itemInicialEntrada }]);
  };

  const removerItemEntrada = (index) => {
    setItensEntrada(prevItens => {
      if (prevItens.length <= 1) {
        return [{ ...itemInicialEntrada }];
      }
      return prevItens.filter((_, idx) => idx !== index);
    });
  };

  const atualizarItemEntrada = (index, campo, valor) => {
    setItensEntrada(prevItens => {
      const novosItens = [...prevItens];
      novosItens[index][campo] = valor;
      return novosItens;
    });
  };

  const salvarLancamento = (e) => {
    e.preventDefault();

    if (!congregacaoIdForm) {
      showToast("Por favor, selecione a congregação.", "warning");
      return;
    }

    const congregacaoObj = { id: parseInt(congregacaoIdForm) };

    if (tipoForm === 'ENTRADA') {
      for (let item of itensEntrada) {
        if (!item.valor || parseFloat(item.valor) <= 0) {
          showToast("Informe um valor válido maior que zero para todos os itens da entrada.", "warning");
          return;
        }
      }

      const lote = itensEntrada.map(item => ({
        tipo: 'ENTRADA',
        categoria: item.categoria,
        descricao: item.descricao || `${item.categoria} (${item.formaPagamento})`,
        valor: parseFloat(item.valor),
        formaPagamento: item.formaPagamento,
        dataLancamento: dataForm,
        congregacao: congregacaoObj,
        membro: item.membroId ? { id: parseInt(item.membroId) } : null
      }));

      api.post('/lancamentos/lote', lote)
        .then(() => {
          showToast(`${lote.length} lançamento(s) de entrada registrado(s) com sucesso!`, "success");
          fecharEAtualizarModal();
        })
        .catch(err => {
          console.error("Erro ao cadastrar lote", err);
          showToast("Erro ao cadastrar entradas.", "error");
        });

    } else {
      if (!formSaida.valor || parseFloat(formSaida.valor) <= 0) {
        showToast("Informe um valor válido para a saída.", "warning");
        return;
      }
      if (!formSaida.descricao) {
        showToast("Informe o motivo/descrição da saída.", "warning");
        return;
      }

      const payload = {
        tipo: 'SAIDA',
        categoria: formSaida.categoria,
        descricao: formSaida.descricao,
        destinatario: formSaida.destinatario,
        formaPagamento: formSaida.formaPagamento,
        valor: parseFloat(formSaida.valor),
        dataLancamento: dataForm,
        congregacao: congregacaoObj
      };

      api.post('/lancamentos', payload)
        .then(() => {
          showToast("Lançamento de saída (retirada) registrado com sucesso!", "success");
          fecharEAtualizarModal();
        })
        .catch(err => {
          console.error("Erro ao registrar saída", err);
          showToast("Erro ao registrar saída.", "error");
        });
    }
  };

  const usuarioLogado = localStorage.getItem('usuarioLogado') || '';
  const loginUsuario = localStorage.getItem('loginUsuario') || '';
  const isAdmin = usuarioLogado.toLowerCase().includes('admin') || loginUsuario.toLowerCase() === 'admin';

  const fecharEAtualizarModal = () => {
    setModalAberto(false);
    setItensEntrada([{ ...itemInicialEntrada }]);
    setFormSaida({ descricao: '', destinatario: '', categoria: 'Manutenção', formaPagamento: 'Pix', valor: '' });
    carregarDados();
  };

  const deletarLancamento = (id) => {
    if (!isAdmin) {
      showToast("Acesso negado. Apenas o usuário ADMINISTRADOR pode excluir lançamentos financeiros.", "error");
      return;
    }

    showConfirm({
      titulo: 'Excluir Lançamento Financeiro',
      mensagem: 'Deseja realmente excluir este lançamento financeiro? Esta ação não poderá ser desfeita.',
      textoConfirmar: 'Excluir Lançamento',
      danger: true,
      onConfirm: () => {
        api.delete(`/lancamentos/${id}`)
          .then(() => {
            showToast("Lançamento excluído com sucesso!", "success");
            carregarDados();
          })
          .catch(err => {
            if (err.response && err.response.status === 403) {
              showToast("Acesso negado. Apenas o administrador tem permissão para excluir lançamentos financeiros.", "error");
            } else {
              showToast("Erro ao excluir lançamento. Tente novamente.", "error");
            }
          });
      }
    });
  };

  const listaSeguraLancamentos = Array.isArray(lancamentos) ? lancamentos : [];

  const anosDisponiveis = Array.from(
    new Set([
      new Date().getFullYear().toString(),
      ...listaSeguraLancamentos.map(l => l.dataLancamento ? l.dataLancamento.split('-')[0] : '').filter(Boolean)
    ])
  ).sort((a, b) => b - a);

  const extrairMesEAno = (dataStr) => {
    if (!dataStr) return { mes: '', ano: '' };
    const partes = dataStr.split('-');
    return partes.length === 3
      ? { ano: partes[0], mes: String(parseInt(partes[1], 10)) }
      : { mes: '', ano: '' };
  };

  // FILTRAGEM DE LANÇAMENTOS POR CONGREGAÇÃO, MÊS, ANO E TERMO DE BUSCA
  const lancamentosFiltrados = listaSeguraLancamentos.filter(item => {
    if (buscaTexto.trim() !== '') {
      const termo = buscaTexto.toLowerCase();
      const matchDesc = item.descricao && item.descricao.toLowerCase().includes(termo);
      const matchCat = item.categoria && item.categoria.toLowerCase().includes(termo);
      const matchCong = item.congregacao && item.congregacao.nome && item.congregacao.nome.toLowerCase().includes(termo);
      const matchDest = item.destinatario && item.destinatario.toLowerCase().includes(termo);
      const matchResp = item.responsavel && item.responsavel.toLowerCase().includes(termo);
      const matchMembro = item.membro && item.membro.nome && item.membro.nome.toLowerCase().includes(termo);
      if (!matchDesc && !matchCat && !matchCong && !matchDest && !matchResp && !matchMembro) {
        return false;
      }
    }
    if (congregacaoFiltro !== 'TODAS') {
      if (!item.congregacao || item.congregacao.id !== parseInt(congregacaoFiltro)) {
        return false;
      }
    }
    const { mes, ano } = extrairMesEAno(item.dataLancamento);
    if (mesFiltro !== 'TODOS' && mes !== mesFiltro) {
      return false;
    }
    if (anoFiltro !== 'TODOS' && ano !== anoFiltro) {
      return false;
    }
    return true;
  });

  // FILTRAGEM POR ABA DE NAVEGAÇÃO
  const lancamentosExibidos = lancamentosFiltrados.filter(item => {
    if (abaAtiva === 'ENTRADAS') return item.tipo === 'ENTRADA';
    if (abaAtiva === 'SAIDAS') return item.tipo === 'SAIDA';
    if (abaAtiva === 'DIZIMOS') return item.tipo === 'ENTRADA' && item.categoria === 'Dízimos';
    return true;
  });

  // CÁLCULOS TOTAIS
  const totalEntradas = lancamentosFiltrados
    .filter(l => l.tipo === 'ENTRADA')
    .reduce((acc, curr) => acc + (curr.valor || 0), 0);

  const totalSaidas = lancamentosFiltrados
    .filter(l => l.tipo === 'SAIDA')
    .reduce((acc, curr) => acc + (curr.valor || 0), 0);

  const saldoAtual = totalEntradas - totalSaidas;

  // CÁLCULO SEPARADO: EM MÃO (DINHEIRO) vs NA CONTA (PIX/BANCO)
  const eDinheiro = (forma) => (forma || 'Dinheiro').toLowerCase() === 'dinheiro';

  const entradasDinheiro = lancamentosFiltrados
    .filter(l => l.tipo === 'ENTRADA' && eDinheiro(l.formaPagamento))
    .reduce((acc, curr) => acc + (curr.valor || 0), 0);

  const saidasDinheiro = lancamentosFiltrados
    .filter(l => l.tipo === 'SAIDA' && eDinheiro(l.formaPagamento))
    .reduce((acc, curr) => acc + (curr.valor || 0), 0);

  const saldoEmMao = entradasDinheiro - saidasDinheiro;

  const entradasConta = lancamentosFiltrados
    .filter(l => l.tipo === 'ENTRADA' && !eDinheiro(l.formaPagamento))
    .reduce((acc, curr) => acc + (curr.valor || 0), 0);

  const saidasConta = lancamentosFiltrados
    .filter(l => l.tipo === 'SAIDA' && !eDinheiro(l.formaPagamento))
    .reduce((acc, curr) => acc + (curr.valor || 0), 0);

  const saldoNaConta = entradasConta - saidasConta;

  // AGRUPAMENTO DE ENTRADAS PARA A "VISÃO GERAL" (CONCATENADO POR CATEGORIA)
  const obterEntradasAgrupadas = () => {
    const mapa = {};
    lancamentosExibidos
      .filter(l => l.tipo === 'ENTRADA')
      .forEach(item => {
        const cat = item.categoria || 'Outros';
        if (!mapa[cat]) {
          mapa[cat] = {
            categoria: cat,
            quantidade: 0,
            total: 0,
            formasPagamentoSet: new Set()
          };
        }
        mapa[cat].quantidade += 1;
        mapa[cat].total += (item.valor || 0);
        mapa[cat].formasPagamentoSet.add(item.formaPagamento || 'Dinheiro');
      });

    return Object.values(mapa).map(g => ({
      ...g,
      formasPagamentoStr: Array.from(g.formasPagamentoSet).join(', ')
    }));
  };

  const entradasAgrupadas = obterEntradasAgrupadas();
  const saidasParaVisaoGeral = lancamentosExibidos.filter(l => l.tipo === 'SAIDA');

  const aplicarMesAtual = () => {
    const hoje = new Date();
    setMesFiltro(String(hoje.getMonth() + 1));
    setAnoFiltro(String(hoje.getFullYear()));
  };

  const limparFiltros = () => {
    setBuscaTexto('');
    setCongregacaoFiltro('TODAS');
    setMesFiltro('TODOS');
    setAnoFiltro('TODOS');
  };

  const totalEntradaLoteModal = itensEntrada.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

  const formatarMoeda = (val) => (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    const partes = dataStr.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : dataStr;
  };

  return (
    <div className="financeiro-wrapper">
      <NavbarHeader 
        tituloModulo="Gestão Financeira"
        descricaoModulo="Dízimos, Ofertas, Saldos Em Mão e Na Conta, Saídas e Relatórios Financeiros"
        botoesAcao={
          <>
            <button 
              onClick={() => setModalRelatorioAberto(true)} 
              style={{ backgroundColor: '#003366', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              📄 Relatório PDF / Impressão
            </button>
            <button onClick={() => setModalAberto(true)} className="btn-novo">➕ Novo Lançamento</button>
          </>
        }
      />

      <div className="financeiro-container">

      {/* BARRA DE FILTROS: CONGREGAÇÃO, MÊS, ANO E BUSCA */}
      <section className="filtro-bar">
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
          <div className="filtro-grupo" style={{ flex: '1.5', minWidth: '220px' }}>
            <label>🔍 Buscar:</label>
            <input 
              type="text" 
              placeholder="Descrição, categoria, membro..." 
              value={buscaTexto} 
              onChange={(e) => setBuscaTexto(e.target.value)} 
              className="filtro-select"
              style={{ backgroundColor: 'white' }}
            />
          </div>

          <div className="filtro-grupo">
            <label>🏢 Congregação:</label>
            <select
              value={congregacaoFiltro}
              onChange={(e) => setCongregacaoFiltro(e.target.value)}
              className="filtro-select"
            >
              <option value="TODAS">Todas (Consolidado)</option>
              {(Array.isArray(congregacoes) ? congregacoes : []).map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label>📅 Mês:</label>
            <select
              value={mesFiltro}
              onChange={(e) => setMesFiltro(e.target.value)}
              className="filtro-select"
            >
              <option value="TODOS">Todos os Meses</option>
              {mesesNomes.map(m => (
                <option key={m.valor} value={m.valor}>{m.nome}</option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label>📆 Ano:</label>
            <select
              value={anoFiltro}
              onChange={(e) => setAnoFiltro(e.target.value)}
              className="filtro-select"
              style={{ minWidth: '110px' }}
            >
              <option value="TODOS">Todos os Anos</option>
              {anosDisponiveis.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </div>

          <button type="button" onClick={aplicarMesAtual} className="filtro-btn-rapido" title="Filtrar pelo mês atual">
            🗓️ Mês Atual
          </button>
          <button type="button" onClick={limparFiltros} className="filtro-btn-rapido" style={{ backgroundColor: '#f8f9fa', color: '#555', borderColor: '#ccc' }} title="Exibir todo o histórico">
            🔄 Ver Todos
          </button>
        </div>

        <span style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
          Exibindo {lancamentosFiltrados.length} resultado(s)
        </span>
      </section>

      {/* CARDS DE RESUMO FINANCEIRO (INCLUINDO EM MÃO E NA CONTA) */}
      <section className="resumo-grid">
        <div className="resumo-card entradas">
          <span>Total de Entradas</span>
          <h2>{formatarMoeda(totalEntradas)}</h2>
        </div>

        <div className="resumo-card saidas">
          <span>Total de Saídas (Retiradas)</span>
          <h2>{formatarMoeda(totalSaidas)}</h2>
        </div>

        <div className="resumo-card saldo">
          <span>Saldo Total em Caixa</span>
          <h2>{formatarMoeda(saldoAtual)}</h2>
        </div>

        <div className="resumo-card em-mao">
          <span>💵 Em Mão (Dinheiro)</span>
          <h2>{formatarMoeda(saldoEmMao)}</h2>
        </div>

        <div className="resumo-card na-conta">
          <span>💳 Na Conta (PIX / Banco)</span>
          <h2>{formatarMoeda(saldoNaConta)}</h2>
        </div>
      </section>

      {/* SELETOR DE MODO DE VISUALIZAÇÃO E ABAS */}
      <div className="controles-tabela-bar">
        <div className="abas-container" style={{ margin: 0, borderBottom: 'none' }}>
          <button
            className={`aba-btn ${abaAtiva === 'TODOS' ? 'ativa' : ''}`}
            onClick={() => setAbaAtiva('TODOS')}
          >
            📊 Todos ({lancamentosFiltrados.length})
          </button>
          <button
            className={`aba-btn ${abaAtiva === 'ENTRADAS' ? 'ativa' : ''}`}
            onClick={() => setAbaAtiva('ENTRADAS')}
          >
            🟢 Entradas ({lancamentosFiltrados.filter(l => l.tipo === 'ENTRADA').length})
          </button>
          <button
            className={`aba-btn ${abaAtiva === 'SAIDAS' ? 'ativa' : ''}`}
            onClick={() => setAbaAtiva('SAIDAS')}
          >
            🔴 Saídas ({lancamentosFiltrados.filter(l => l.tipo === 'SAIDA').length})
          </button>
          <button
            className={`aba-btn ${abaAtiva === 'DIZIMOS' ? 'ativa' : ''}`}
            onClick={() => setAbaAtiva('DIZIMOS')}
          >
            📜 Dízimos ({lancamentosFiltrados.filter(l => l.tipo === 'ENTRADA' && l.categoria === 'Dízimos').length})
          </button>
        </div>

        <div className="modo-vis-btn-group">
          <button 
            className={`modo-vis-btn ${modoVisualizacao === 'DETALHADO' ? 'ativo' : ''}`}
            onClick={() => setModoVisualizacao('DETALHADO')}
            title="Exibe cada lançamento linha por linha"
          >
            📋 Detalhado (Por Linha)
          </button>
          <button 
            className={`modo-vis-btn ${modoVisualizacao === 'GERAL' ? 'ativo' : ''}`}
            onClick={() => setModoVisualizacao('GERAL')}
            title="Soma e agrupa as entradas por categoria"
          >
            📊 Visão Geral (Agrupada)
          </button>
        </div>
      </div>

      {/* TABELA DE LANÇAMENTOS */}
      <main className="tabela-container">
        {lancamentosExibidos.length === 0 ? (
          <p className="msg-vazia">Nenhum lançamento encontrado para os filtros selecionados.</p>
        ) : abaAtiva === 'DIZIMOS' ? (
          /* TABELA DEDICADA PARA DÍZIMOS COM NOME DO MEMBRO */
          <table className="membros-tabela">
            <thead>
              <tr>
                <th>Data</th>
                <th>Nome do Membro Dizimista</th>
                <th>Congregação</th>
                <th>Forma de Pagamento</th>
                <th>Registrado Por</th>
                <th style={{ textAlign: 'right' }}>Valor do Dízimo</th>
                <th style={{ width: '60px', textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {lancamentosExibidos.map(item => (
                <tr key={item.id}>
                  <td>{formatarData(item.dataLancamento)}</td>
                  <td>
                    <strong>👤 {item.membro ? item.membro.nome : 'Dízimo Anônimo / Geral'}</strong>
                    {item.membro && <div style={{ fontSize: '0.8rem', color: '#666' }}>{item.membro.cargo}</div>}
                  </td>
                  <td>{item.congregacao ? item.congregacao.nome : '-'}</td>
                  <td>
                    <span className={`badge-pagamento ${item.formaPagamento?.toLowerCase() || ''}`}>
                      {item.formaPagamento || 'Dinheiro'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.9rem', color: '#555' }}>{item.responsavel || 'Sistema'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#28a745' }}>
                    + {formatarMoeda(item.valor)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {isAdmin ? (
                      <ActionMenu actions={[
                        { label: 'Excluir Lançamento', icon: <FaTrashAlt />, danger: true, onClick: () => deletarLancamento(item.id) },
                      ]} />
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : modoVisualizacao === 'GERAL' ? (
          /* MODALIDADE 2: VISÃO GERAL (ENTRADAS AGRUPADAS POR CATEGORIA, SAÍDAS INDIVIDUAIS) */
          <div>
            <h4 style={{ color: '#003366', marginBottom: '15px' }}>
              📊 Resumo Agrupado por Categoria
            </h4>
            <table className="membros-tabela" style={{ marginBottom: '30px' }}>
              <thead>
                <tr>
                  <th>Categoria / Origem</th>
                  <th>Total de Lançamentos</th>
                  <th>Formas de Recebimento</th>
                  <th style={{ textAlign: 'right' }}>Valor Total Consolidado</th>
                </tr>
              </thead>
              <tbody>
                {entradasAgrupadas.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: '#888' }}>Nenhuma entrada no período.</td></tr>
                ) : (
                  entradasAgrupadas.map((grupo, idx) => (
                    <tr key={idx}>
                      <td><strong>🟢 {grupo.categoria}</strong></td>
                      <td>{grupo.quantidade} lançamento(s)</td>
                      <td>{grupo.formasPagamentoStr}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#28a745', fontSize: '1.05rem' }}>
                        + {formatarMoeda(grupo.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {saidasParaVisaoGeral.length > 0 && (
              <>
                <h4 style={{ color: '#dc3545', marginBottom: '15px' }}>
                  🔴 Detalhamento de Saídas / Retiradas
                </h4>
                <table className="membros-tabela">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Motivo / Descrição</th>
                      <th>Favorecido / Destinatário</th>
                      <th>Categoria</th>
                      <th>Forma Pagto</th>
                      <th style={{ textAlign: 'right' }}>Valor</th>
                      <th style={{ width: '60px', textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {saidasParaVisaoGeral.map(item => (
                      <tr key={item.id}>
                        <td>{formatarData(item.dataLancamento)}</td>
                        <td><strong>{item.descricao}</strong></td>
                        <td>{item.destinatario || '-'}</td>
                        <td>{item.categoria}</td>
                        <td>{item.formaPagamento || 'Pix'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#dc3545' }}>
                          - {formatarMoeda(item.valor)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {isAdmin ? (
                            <ActionMenu actions={[
                              { label: 'Excluir Lançamento', icon: <FaTrashAlt />, danger: true, onClick: () => deletarLancamento(item.id) },
                            ]} />
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        ) : (
          /* MODALIDADE 1: VISÃO DETALHADA LINHA POR LINHA */
          <table className="membros-tabela">
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Descrição / Categoria</th>
                <th>Congregação</th>
                <th>Forma Pagto</th>
                <th>Membro / Favorecido</th>
                <th>Registrado por</th>
                <th>Valor</th>
                <th style={{ width: '60px', textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {lancamentosExibidos.map(item => (
                <tr key={item.id}>
                  <td>{formatarData(item.dataLancamento)}</td>
                  <td>
                    <span className={`badge-tipo ${item.tipo?.toLowerCase() || ''}`}>
                      {item.tipo === 'ENTRADA' ? 'ENTRADA' : 'SAÍDA'}
                    </span>
                  </td>
                  <td>
                    <strong>{item.descricao}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{item.categoria}</div>
                  </td>
                  <td>{item.congregacao ? item.congregacao.nome : '-'}</td>
                  <td>
                    <span className={`badge-pagamento ${item.formaPagamento?.toLowerCase() || ''}`}>
                      {item.formaPagamento || 'Dinheiro'}
                    </span>
                  </td>
                  <td>
                    {item.tipo === 'ENTRADA' 
                      ? (item.membro ? item.membro.nome : '-') 
                      : (item.destinatario || '-')}
                  </td>
                  <td style={{ fontSize: '0.9rem', color: '#555' }}>👤 {item.responsavel || 'Sistema'}</td>
                  <td className={item.tipo === 'ENTRADA' ? 'valor-entrada' : 'valor-saida'}>
                    {item.tipo === 'ENTRADA' ? `+ ${formatarMoeda(item.valor)}` : `- ${formatarMoeda(item.valor)}`}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {isAdmin ? (
                      <ActionMenu actions={[
                        { label: 'Excluir Lançamento', icon: <FaTrashAlt />, danger: true, onClick: () => deletarLancamento(item.id) },
                      ]} />
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      {/* MODAL DE NOVO LANÇAMENTO */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>Registrar Movimentação Financeira</h2>
            <form onSubmit={salvarLancamento} className="form-membro">
              
              <div className="form-linha">
                <div className="form-grupo">
                  <label>Tipo de Operação *</label>
                  <select value={tipoForm} onChange={(e) => setTipoForm(e.target.value)}>
                    <option value="ENTRADA">🟢 Entrada (Dízimos, Ofertas, PIX...)</option>
                    <option value="SAIDA">🔴 Saída / Retirada (Despesa, Pagamento)</option>
                  </select>
                </div>

                <div className="form-grupo">
                  <label>Data *</label>
                  <input
                    type="date"
                    value={dataForm}
                    onChange={(e) => setDataForm(e.target.value)}
                    required
                  />
                </div>

                <div className="form-grupo">
                  <label>Congregação *</label>
                  <select
                    value={congregacaoIdForm}
                    onChange={(e) => setCongregacaoIdForm(e.target.value)}
                    required
                  >
                    <option value="">Selecione a Congregação</option>
                    {(Array.isArray(congregacoes) ? congregacoes : []).map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              {tipoForm === 'ENTRADA' ? (
                <div className="itens-lote-box">
                  <h4 style={{ color: '#003366', marginBottom: '10px' }}>
                    Itens da Entrada
                  </h4>

                  {itensEntrada.map((item, index) => (
                    <div key={index} className="item-lote-linha">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px dashed #cbd5e1' }}>
                        <strong style={{ color: '#003366', fontSize: '0.95rem' }}>Item #{index + 1}</strong>
                        {itensEntrada.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removerItemEntrada(index);
                            }}
                            className="btn-remover-item"
                            style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                          >
                            🗑️ Remover Item
                          </button>
                        )}
                      </div>

                      <div className="form-linha" style={{ marginBottom: '10px' }}>
                        <div className="form-grupo">
                          <label>Categoria</label>
                          <select
                            value={item.categoria}
                            onChange={(e) => atualizarItemEntrada(index, 'categoria', e.target.value)}
                          >
                            <option value="Dízimos">Dízimo</option>
                            <option value="Ofertas">Oferta Geral</option>
                            <option value="Oferta de Missões">Oferta de Missões</option>
                            <option value="Oferta de Construção">Oferta de Construção</option>
                            <option value="Eventos">Eventos / Cultos Especiais</option>
                            <option value="Outros">Outros</option>
                          </select>
                        </div>

                        <div className="form-grupo">
                          <label>Forma de Pagamento</label>
                          <select
                            value={item.formaPagamento}
                            onChange={(e) => atualizarItemEntrada(index, 'formaPagamento', e.target.value)}
                          >
                            <option value="Dinheiro">Dinheiro</option>
                            <option value="Pix">PIX</option>
                            <option value="Transferência">Transferência Bancária</option>
                            <option value="Cartão">Cartão de Crédito/Débito</option>
                          </select>
                        </div>

                        <div className="form-grupo">
                          <label>Valor (R$) *</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={item.valor}
                            onChange={(e) => atualizarItemEntrada(index, 'valor', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-linha">
                        <div className="form-grupo">
                          <label>Membro (se for Dízimo/Oferta Pessoal)</label>
                          <select
                            value={item.membroId}
                            onChange={(e) => atualizarItemEntrada(index, 'membroId', e.target.value)}
                          >
                            <option value="">Anônimo / Geral</option>
                            {(Array.isArray(membros) ? membros : []).map(m => (
                              <option key={m.id} value={m.id}>{m.nome} ({m.cargo})</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-grupo">
                          <label>Observação / Descrição</label>
                          <input
                            type="text"
                            placeholder="Ex: Culto de Domingo à noite"
                            value={item.descricao}
                            onChange={(e) => atualizarItemEntrada(index, 'descricao', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={adicionarItemEntrada}
                    className="btn-adicionar-item"
                  >
                    ➕ Adicionar Outro Item (Ex: Oferta, PIX, etc.)
                  </button>

                  <div className="total-lote-destaque">
                    Total das Entradas: <strong>{formatarMoeda(totalEntradaLoteModal)}</strong>
                  </div>
                </div>
              ) : (
                <div className="itens-lote-box" style={{ background: '#fff5f5', borderColor: '#feb2b2' }}>
                  <h4 style={{ color: '#c53030', marginBottom: '15px' }}>
                    Dados da Saída / Retirada
                  </h4>

                  <div className="form-linha">
                    <div className="form-grupo" style={{ flex: '2' }}>
                      <label>Motivo / Descrição da Saída *</label>
                      <input
                        type="text"
                        placeholder="Ex: Pagamento da Conta de Energia da Sede"
                        value={formSaida.descricao}
                        onChange={(e) => setFormSaida({ ...formSaida, descricao: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-grupo">
                      <label>Valor (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formSaida.valor}
                        onChange={(e) => setFormSaida({ ...formSaida, valor: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-linha">
                    <div className="form-grupo">
                      <label>Destinatário / Retirado Para (Favorecido)</label>
                      <input
                        type="text"
                        placeholder="Ex: Energisa, Irmão João (Pintor), Padaria"
                        value={formSaida.destinatario}
                        onChange={(e) => setFormSaida({ ...formSaida, destinatario: e.target.value })}
                      />
                    </div>

                    <div className="form-grupo">
                      <label>Categoria</label>
                      <select
                        value={formSaida.categoria}
                        onChange={(e) => setFormSaida({ ...formSaida, categoria: e.target.value })}
                      >
                        <option value="Contas Fixas">Contas Fixas (Luz/Água/Internet)</option>
                        <option value="Manutenção">Manutenção e Reformas</option>
                        <option value="Missões">Ajuda Missionária / Social</option>
                        <option value="Eventos">Eventos e Festividades</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>

                    <div className="form-grupo">
                      <label>Forma de Pagamento</label>
                      <select
                        value={formSaida.formaPagamento}
                        onChange={(e) => setFormSaida({ ...formSaida, formaPagamento: e.target.value })}
                      >
                        <option value="Pix">PIX</option>
                        <option value="Dinheiro">Dinheiro (Espécie)</option>
                        <option value="Transferência">Transferência</option>
                        <option value="Boleto">Boleto Bancário</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="modal-botoes">
                <button type="button" onClick={() => setModalAberto(false)} className="btn-cancelar">Cancelar</button>
                <button type="submit" className="btn-salvar">
                  Salvar {tipoForm === 'ENTRADA' ? `${itensEntrada.length} Entrada(s)` : 'Saída'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL DE VISUALIZAÇÃO E IMPRESSÃO DE RELATÓRIO PDF */}
      {modalRelatorioAberto && (
        <div className="modal-overlay modal-relatorio-overlay">
          <div className="modal-content modal-relatorio-content" style={{ maxWidth: '900px', maxHeight: '95vh', overflowY: 'auto' }}>
            <div className="relatorio-acoes-topo no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
              <h3 style={{ margin: 0, color: '#003366' }}>Pré-visualização do Relatório Financeiro</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => window.print()} 
                  style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🖨️ Imprimir / Salvar em PDF
                </button>
                <button 
                  onClick={() => setModalRelatorioAberto(false)} 
                  style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* ÁREA IMPRESSA */}
            <div className="relatorio-folha-impressao">
              <div className="relatorio-header-oficial" style={{ textAlign: 'center', borderBottom: '2px solid #003366', paddingBottom: '15px', marginBottom: '20px' }}>
                <h1 style={{ margin: '0 0 5px 0', color: '#003366', fontSize: '1.6rem', textTransform: 'uppercase' }}>Igreja Evangélica Assembleia de Deus</h1>
                <h3 style={{ margin: '0 0 5px 0', color: '#555', fontSize: '1.1rem' }}>Portal Conecta ADCESE — Relatório Financeiro</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#777' }}>Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
              </div>

              <div className="relatorio-info-filtros" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '15px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <div><strong>Congregação:</strong> {congregacaoFiltro === 'TODAS' ? 'Todas (Consolidado)' : ((Array.isArray(congregacoes) ? congregacoes : []).find(c => String(c.id) === String(congregacaoFiltro))?.nome || 'Congregação')}</div>
                  <div><strong>Mês de Referência:</strong> {mesFiltro === 'TODOS' ? 'Todos os Meses' : (mesesNomes.find(m => m.valor === mesFiltro)?.nome || mesFiltro)}</div>
                  <div><strong>Ano:</strong> {anoFiltro === 'TODOS' ? 'Todos os Anos' : anoFiltro}</div>
                  <div><strong>Filtro de Exibição:</strong> {abaAtiva}</div>
                </div>
              </div>

              <div className="relatorio-resumo-caixas" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '25px', textAlign: 'center' }}>
                <div style={{ border: '1px solid #28a745', background: '#eafaf1', padding: '10px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#1e7e34', fontWeight: 'bold' }}>ENTRADAS TOTAIS</span>
                  <h4 style={{ margin: '5px 0 0 0', color: '#28a745' }}>{formatarMoeda(totalEntradas)}</h4>
                </div>
                <div style={{ border: '1px solid #dc3545', background: '#fdf2f2', padding: '10px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#bd2130', fontWeight: 'bold' }}>SAÍDAS TOTAIS</span>
                  <h4 style={{ margin: '5px 0 0 0', color: '#dc3545' }}>{formatarMoeda(totalSaidas)}</h4>
                </div>
                <div style={{ border: '1px solid #003366', background: '#ebf3fa', padding: '10px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#003366', fontWeight: 'bold' }}>SALDO TOTAL</span>
                  <h4 style={{ margin: '5px 0 0 0', color: '#003366' }}>{formatarMoeda(saldoAtual)}</h4>
                </div>
                <div style={{ border: '1px solid #d97706', background: '#fffbe6', padding: '10px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 'bold' }}>EM MÃO (DINHEIRO)</span>
                  <h4 style={{ margin: '5px 0 0 0', color: '#d97706' }}>{formatarMoeda(saldoEmMao)}</h4>
                </div>
                <div style={{ border: '1px solid #0891b2', background: '#e6fcff', padding: '10px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#0891b2', fontWeight: 'bold' }}>NA CONTA (PIX/BANCO)</span>
                  <h4 style={{ margin: '5px 0 0 0', color: '#0891b2' }}>{formatarMoeda(saldoNaConta)}</h4>
                </div>
              </div>

              <table className="membros-tabela relatorio-tabela-pdf" style={{ width: '100%', fontSize: '0.85rem', marginBottom: '40px' }}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Descrição / Categoria</th>
                    <th>Congregação</th>
                    <th>Forma Pagto</th>
                    <th>Favorecido / Membro</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {lancamentosExibidos.map(item => (
                    <tr key={item.id}>
                      <td>{formatarData(item.dataLancamento)}</td>
                      <td>
                        <strong style={{ color: item.tipo === 'ENTRADA' ? '#28a745' : '#dc3545' }}>
                          {item.tipo}
                        </strong>
                      </td>
                      <td>
                        <strong>{item.descricao}</strong> ({item.categoria})
                      </td>
                      <td>{item.congregacao ? item.congregacao.nome : '-'}</td>
                      <td>{item.formaPagamento || 'Dinheiro'}</td>
                      <td>{item.tipo === 'ENTRADA' ? (item.membro ? item.membro.nome : 'Geral') : (item.destinatario || '-')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', color: item.tipo === 'ENTRADA' ? '#28a745' : '#dc3545' }}>
                        {item.tipo === 'ENTRADA' ? `+ ${formatarMoeda(item.valor)}` : `- ${formatarMoeda(item.valor)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="relatorio-assinaturas" style={{ display: 'flex', justifyContent: 'space-around', marginTop: '60px', paddingTop: '20px', textAlign: 'center' }}>
                <div style={{ width: '40%' }}>
                  <div style={{ borderTop: '1px solid #333', paddingTop: '5px' }}>
                    <strong>Tesoureiro(a) Responsável</strong>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Conecta ADCESE</div>
                  </div>
                </div>
                <div style={{ width: '40%' }}>
                  <div style={{ borderTop: '1px solid #333', paddingTop: '5px' }}>
                    <strong>Pastor Presidente / Dirigente</strong>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>ADCESE</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default Financeiro;
