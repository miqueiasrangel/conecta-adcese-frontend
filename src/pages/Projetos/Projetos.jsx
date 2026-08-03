import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import NavbarHeader from '../../components/NavbarHeader/NavbarHeader';
import ActionMenu from '../../components/ActionMenu/ActionMenu';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
import '../Secretaria/Secretaria.css';
import './Projetos.css';

function Projetos() {
  const { showToast, showConfirm } = useToast();
  // ESTADOS DE DADOS
  const [projetos, setProjetos] = useState([]);
  const [congregacoes, setCongregacoes] = useState([]);
  const [membros, setMembros] = useState([]);

  // ESTADOS DE FILTRO
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroCongregacao, setFiltroCongregacao] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  // MODAIS
  const [modalProjetoAberto, setModalProjetoAberto] = useState(false);
  const [modalDoacaoAberto, setModalDoacaoAberto] = useState(false);
  const [modalAtendimentoAberto, setModalAtendimentoAberto] = useState(false);
  const [modalTelaoAberto, setModalTelaoAberto] = useState(false);

  // SELEÇÃO ATIVA
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);

  // FORMULÁRIO DE PROJETO
  const estadoInicialProjeto = {
    id: null,
    titulo: '',
    descricao: '',
    tipo: 'Assistência Social',
    congregacao: 'Sede',
    coordenador: '',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: '',
    metaFinanceira: '',
    arrecadadoFinanceiro: 0,
    metaItens: '100 Cestas Básicas',
    status: 'Em Andamento',
    qtdFamiliasAtendidas: 0
  };

  const [formProjeto, setFormProjeto] = useState(estadoInicialProjeto);

  // FORMULÁRIO DE DOAÇÃO (FÍSICA OU FINANCEIRA)
  const [formDoacao, setFormDoacao] = useState({
    tipoDoacao: 'ITEM', // 'ITEM' ou 'FINANCEIRO'
    item: 'Arroz',
    quantidade: '',
    unidadeMedida: 'Kg',
    valorFinanceiro: '',
    doador: ''
  });

  // FORMULÁRIO DE ATENDIMENTO A FAMÍLIAS
  const [formAtendimento, setFormAtendimento] = useState({
    nomeResponsavel: '',
    qtdPessoasFamilia: 1,
    itensEntregues: '1 Cesta Básica + 2 Agasalhos',
    dataAtendimento: new Date().toISOString().split('T')[0],
    observacao: ''
  });

  const tiposProjetoOpcoes = [
    'Assistência Social',
    'Campanha de Arrecadação',
    'Obra / Reformas',
    'Missão Transcultural',
    'Apoio a Entidades / Casas de Acolhimento'
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
    api.get('/projetos')
      .then(res => {
        const lista = Array.isArray(res.data) ? res.data : (res.data?.content || []);
        setProjetos(lista);
      })
      .catch(err => console.error("Erro ao carregar projetos:", err));

    api.get('/congregacoes')
      .then(res => {
        const lista = Array.isArray(res.data) ? res.data : (res.data?.content || []);
        setCongregacoes(lista);
      })
      .catch(err => console.error("Erro ao carregar congregações:", err));

    api.get('/membros')
      .then(res => {
        const lista = Array.isArray(res.data) ? res.data : (res.data?.content || []);
        setMembros(lista);
      })
      .catch(err => console.error("Erro ao carregar membros:", err));
  };

  const listaSeguraProjetos = Array.isArray(projetos) ? projetos : [];

  // FILTRAGEM
  const projetosFiltrados = listaSeguraProjetos.filter(p => {
    if (filtroTipo && p.tipo !== filtroTipo) return false;
    if (filtroCongregacao && p.congregacao !== filtroCongregacao) return false;
    if (filtroStatus && p.status !== filtroStatus) return false;
    return true;
  });

  // TOTAIS ACUMULADOS DE IMPACTO SOCIAL
  const totalArrecadadoFinanceiro = projetosFiltrados.reduce((acc, p) => acc + (p.arrecadadoFinanceiro || 0), 0);
  const totalFamiliasAtendidas = projetosFiltrados.reduce((acc, p) => acc + (p.qtdFamiliasAtendidas || 0), 0);
  
  // SOMA DOS ITENS DOADOS (KG E UNIDADES)
  let totalKgAlimentos = 0;
  let totalCestasUnidades = 0;

  projetosFiltrados.forEach(p => {
    (p.doacoes || []).forEach(d => {
      if (d.unidadeMedida === 'Kg') totalKgAlimentos += (d.quantidade || 0);
      if (d.item && d.item.toLowerCase().includes('cesta')) totalCestasUnidades += (d.quantidade || 0);
    });
  });

  // SALVAR OU EDITAR PROJETO
  const salvarProjeto = (e) => {
    e.preventDefault();
    const payload = {
      ...formProjeto,
      metaFinanceira: parseFloat(formProjeto.metaFinanceira) || 0
    };

    if (formProjeto.id) {
      api.put(`/projetos/${formProjeto.id}`, payload)
        .then(() => {
          showToast("Projeto / Campanha atualizado com sucesso!", "success");
          setModalProjetoAberto(false);
          carregarDados();
        })
        .catch(err => showToast("Erro ao atualizar projeto.", "error"));
    } else {
      api.post('/projetos', payload)
        .then(() => {
          showToast("Projeto / Campanha cadastrado com sucesso!", "success");
          setModalProjetoAberto(false);
          carregarDados();
        })
        .catch(err => showToast("Erro ao cadastrar projeto.", "error"));
    }
  };

  const deletarProjeto = (id) => {
    showConfirm({
      titulo: 'Excluir Projeto Social',
      mensagem: 'Deseja realmente excluir esta campanha? Esta ação não poderá ser desfeita.',
      textoConfirmar: 'Excluir Projeto',
      danger: true,
      onConfirm: () => {
        api.delete(`/projetos/${id}`)
          .then(() => {
            showToast("Projeto excluído com sucesso!", "success");
            carregarDados();
          })
          .catch(err => {
            console.error("Erro ao excluir projeto", err);
            showToast("Erro ao excluir projeto.", "error");
          });
      }
    });
  };

  // REGISTRAR DOAÇÃO (FÍSICA OU RECURSO FINANCEIRO)
  const abrirModalDoacao = (projeto) => {
    setProjetoSelecionado(projeto);
    setFormDoacao({
      tipoDoacao: 'ITEM',
      item: 'Arroz',
      quantidade: '',
      unidadeMedida: 'Kg',
      valorFinanceiro: '',
      doador: ''
    });
    setModalDoacaoAberto(true);
  };

  const salvarDoacao = (e) => {
    e.preventDefault();
    if (!projetoSelecionado) return;

    if (formDoacao.tipoDoacao === 'FINANCEIRO') {
      const val = parseFloat(formDoacao.valorFinanceiro);
      if (!val || val <= 0) {
        showToast("Informe um valor financeiro válido.", "warning");
        return;
      }

      const projetoAtualizado = {
        ...projetoSelecionado,
        arrecadadoFinanceiro: (projetoSelecionado.arrecadadoFinanceiro || 0) + val
      };

      api.put(`/projetos/${projetoSelecionado.id}`, projetoAtualizado)
        .then(() => {
          showToast(`Doação financeira de ${formatarMoeda(val)} registrada com sucesso!`, "success");
          setModalDoacaoAberto(false);
          carregarDados();
        })
        .catch(err => showToast("Erro ao registrar doação financeira.", "error"));
    } else {
      const qtd = parseFloat(formDoacao.quantidade);
      if (!qtd || qtd <= 0) {
        showToast("Informe uma quantidade válida do item.", "warning");
        return;
      }

      const doacaoItemPayload = {
        item: formDoacao.item,
        quantidade: qtd,
        unidadeMedida: formDoacao.unidadeMedida,
        doador: formDoacao.doador || 'Anônimo',
        dataDoacao: new Date().toISOString().split('T')[0]
      };

      api.post(`/projetos/${projetoSelecionado.id}/doacao`, doacaoItemPayload)
        .then(() => {
          showToast(`Doação de ${qtd} ${formDoacao.unidadeMedida} de "${formDoacao.item}" registrada com sucesso!`, "success");
          setModalDoacaoAberto(false);
          carregarDados();
        })
        .catch(err => showToast("Erro ao registrar doação de item.", "error"));
    }
  };

  // REGISTRAR ATENDIMENTO A FAMÍLIA BENEFICIADA
  const abrirModalAtendimento = (projeto) => {
    setProjetoSelecionado(projeto);
    setFormAtendimento({
      nomeResponsavel: '',
      qtdPessoasFamilia: 1,
      itensEntregues: '1 Cesta Básica + 2 Agasalhos',
      dataAtendimento: new Date().toISOString().split('T')[0],
      observacao: ''
    });
    setModalAtendimentoAberto(true);
  };

  const salvarAtendimento = (e) => {
    e.preventDefault();
    if (!projetoSelecionado) return;

    if (!formAtendimento.nomeResponsavel) {
      showToast("Informe o nome do responsável da família atendida.", "warning");
      return;
    }

    const payload = {
      ...formAtendimento,
      qtdPessoasFamilia: parseInt(formAtendimento.qtdPessoasFamilia) || 1
    };

    api.post(`/projetos/${projetoSelecionado.id}/atendimento`, payload)
      .then(() => {
        showToast("Atendimento de assistência social registrado com sucesso!", "success");
        setModalAtendimentoAberto(false);
        carregarDados();
      })
      .catch(err => showToast("Erro ao registrar atendimento.", "error"));
  };

  const formatarMoeda = (val) => (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    const partes = dataStr.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : dataStr;
  };

  return (
    <div className="projetos-wrapper">
      <NavbarHeader 
        tituloModulo="Projetos Sociais e Missões"
        descricaoModulo="Gestão de Campanhas de Arrecadação, Doações de Itens e Métricas de Impacto Social"
        botoesAcao={
          <>
            <button 
              onClick={() => setModalTelaoAberto(true)} 
              style={{ backgroundColor: '#003366', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              📊 Apresentação para Telão (Culto de Missões)
            </button>
            <button 
              onClick={() => { setFormProjeto(estadoInicialProjeto); setModalProjetoAberto(true); }} 
              className="btn-novo"
            >
              ➕ Nova Campanha / Projeto
            </button>
          </>
        }
      />

      <div className="projetos-container">

      {/* DASHBOARD DE IMPACTO SOCIAL */}
      <section className="impacto-grid">
        <div className="impacto-card familias">
          <span>Famílias Atendidas / Abençoadas</span>
          <h2>{totalFamiliasAtendidas} famílias</h2>
        </div>

        <div className="impacto-card financeiro">
          <span>Recursos Financeiros Arrecadados</span>
          <h2>{formatarMoeda(totalArrecadadoFinanceiro)}</h2>
        </div>

        <div className="impacto-card itens">
          <span>Alimentos / Cestas Arrecadadas</span>
          <h2>{totalKgAlimentos} kg / {totalCestasUnidades} cestas</h2>
        </div>
      </section>

      {/* PAINEL DE FILTROS */}
      <section className="controles-culto-bar">
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
          <div className="filtro-grupo">
            <label>🏷️ Tipo de Projeto:</label>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="filtro-select">
              <option value="">Todos os Tipos</option>
              {tiposProjetoOpcoes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label>🏢 Congregação Responsável:</label>
            <select value={filtroCongregacao} onChange={e => setFiltroCongregacao(e.target.value)} className="filtro-select">
              <option value="">Todas (Consolidado)</option>
              <option value="Sede">Congregação Sede</option>
              {congregacoes.map(c => (
                <option key={c.id} value={c.nome}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label>📌 Status:</label>
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className="filtro-select">
              <option value="">Todos os Status</option>
              <option value="Em Andamento">🟢 Em Andamento</option>
              <option value="Concluído">🏁 Concluído</option>
              <option value="Pausado">⏸️ Pausado</option>
            </select>
          </div>

          {(filtroTipo || filtroCongregacao || filtroStatus) && (
            <button 
              onClick={() => { setFiltroTipo(''); setFiltroCongregacao(''); setFiltroStatus(''); }}
              className="filtro-btn-rapido"
            >
              🔄 Limpar Filtros
            </button>
          )}
        </div>
      </section>

      {/* CARDS DAS CAMPANHAS E PROJETOS */}
      <main className="projetos-cards-grid">
        {projetosFiltrados.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#666' }}>
            <p>Nenhuma campanha ou projeto encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          projetosFiltrados.map(proj => {
            const pctProgresso = proj.metaFinanceira > 0 ? Math.min(100, Math.round((proj.arrecadadoFinanceiro / proj.metaFinanceira) * 100)) : 0;
            return (
              <div key={proj.id} className="projeto-card">
                <div>
                  <div className="projeto-card-hdr">
                    <span className={`badge-tipo-projeto ${proj.tipo.toLowerCase().includes('social') ? 'social' : proj.tipo.toLowerCase().includes('obra') ? 'obra' : ''}`}>
                      {proj.tipo}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: proj.status === 'Em Andamento' ? '#15803d' : '#64748b' }}>
                      {proj.status}
                    </span>
                  </div>

                  <h3>{proj.titulo}</h3>
                  <p>{proj.descricao || 'Sem descrição cadastrada.'}</p>

                  <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '10px' }}>
                    <span>👤 <strong>Coordenador:</strong> {proj.coordenador || 'A definir'}</span><br/>
                    <span>🏢 <strong>Congregação:</strong> {proj.congregacao || 'Sede'}</span>
                  </div>

                  {/* BARRA DE PROGRESSO FINANCEIRO */}
                  {proj.metaFinanceira > 0 && (
                    <div className="progresso-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Meta Financeira:</span>
                        <strong>{formatarMoeda(proj.arrecadadoFinanceiro)} / {formatarMoeda(proj.metaFinanceira)} ({pctProgresso}%)</strong>
                      </div>
                      <div className="progresso-bar-bg">
                        <div className="progresso-bar-fill" style={{ width: `${pctProgresso}%` }}></div>
                      </div>
                    </div>
                  )}

                  {/* RESUMO DE DOAÇÕES DE ITENS FÍSICOS */}
                  <div style={{ marginTop: '12px' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#003366' }}>📦 Doações de Itens Recebidas ({proj.doacoes ? proj.doacoes.length : 0}):</strong>
                    <div className="itens-doados-lista">
                      {proj.doacoes && proj.doacoes.length > 0 ? (
                        proj.doacoes.slice(0, 5).map((d, i) => (
                          <span key={i} className="item-doado-tag">
                            {d.item}: {d.quantidade} {d.unidadeMedida}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Nenhum item físico registrado.</span>
                      )}
                    </div>
                  </div>

                  {/* REGISTRO DE IMPACTO */}
                  <div style={{ marginTop: '15px', background: '#fff5f5', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', color: '#c53030' }}>
                    <strong>❤️ Impacto:</strong> {proj.qtdFamiliasAtendidas || 0} família(s) atendida(s)
                  </div>
                </div>

                <div className="projeto-acoes-footer">
                  <button onClick={() => abrirModalDoacao(proj)} className="btn-card-acao btn-doacao">
                    🎁 Registrar Doação
                  </button>
                  <button onClick={() => abrirModalAtendimento(proj)} className="btn-card-acao btn-atendimento">
                    🤝 Atender Família
                  </button>
                  <ActionMenu actions={[
                    { label: 'Editar Projeto', icon: <FaEdit />, onClick: () => { setFormProjeto(proj); setModalProjetoAberto(true); } },
                    { label: 'Excluir Projeto', icon: <FaTrashAlt />, danger: true, onClick: () => deletarProjeto(proj.id) },
                  ]} />
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* MODAL 1: CADASTRO / EDIÇÃO DE PROJETO E CAMPANHA */}
      {modalProjetoAberto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>{formProjeto.id ? 'Editar Campanha / Projeto' : 'Nova Campanha / Projeto Social'}</h2>
            <form onSubmit={salvarProjeto} className="form-membro">
              <div className="form-grupo">
                <label>Título da Campanha / Projeto *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Projeto Cesta Básica ou Campanha do Agasalho" 
                  value={formProjeto.titulo} 
                  onChange={e => setFormProjeto({ ...formProjeto, titulo: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-grupo">
                <label>Descrição do Objetivo</label>
                <textarea 
                  rows="3" 
                  placeholder="Ex: Arrecadação de alimentos para famílias carentes da congregação e do bairro." 
                  value={formProjeto.descricao} 
                  onChange={e => setFormProjeto({ ...formProjeto, descricao: e.target.value })} 
                />
              </div>

              <div className="form-linha">
                <div className="form-grupo">
                  <label>Tipo de Projeto *</label>
                  <select 
                    value={formProjeto.tipo} 
                    onChange={e => setFormProjeto({ ...formProjeto, tipo: e.target.value })}
                  >
                    {tiposProjetoOpcoes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-grupo">
                  <label>Congregação Responsável *</label>
                  <select 
                    value={formProjeto.congregacao} 
                    onChange={e => setFormProjeto({ ...formProjeto, congregacao: e.target.value })}
                  >
                    <option value="Sede">Congregação Sede</option>
                    {congregacoes.map(c => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-linha">
                <div className="form-grupo">
                  <label>Coordenador / Responsável</label>
                  <select 
                    value={formProjeto.coordenador} 
                    onChange={e => setFormProjeto({ ...formProjeto, coordenador: e.target.value })}
                  >
                    <option value="">Selecione da Secretaria...</option>
                    {membros.map(m => (
                      <option key={m.id} value={m.nome}>{m.nome} ({m.cargo})</option>
                    ))}
                  </select>
                </div>

                <div className="form-grupo">
                  <label>Status *</label>
                  <select 
                    value={formProjeto.status} 
                    onChange={e => setFormProjeto({ ...formProjeto, status: e.target.value })}
                  >
                    <option value="Em Andamento">🟢 Em Andamento</option>
                    <option value="Concluído">🏁 Concluído</option>
                    <option value="Pausado">⏸️ Pausado</option>
                  </select>
                </div>
              </div>

              <div className="form-linha">
                <div className="form-grupo">
                  <label>Data de Início</label>
                  <input 
                    type="date" 
                    value={formProjeto.dataInicio} 
                    onChange={e => setFormProjeto({ ...formProjeto, dataInicio: e.target.value })} 
                  />
                </div>

                <div className="form-grupo">
                  <label>Data Prevista Término</label>
                  <input 
                    type="date" 
                    value={formProjeto.dataFim} 
                    onChange={e => setFormProjeto({ ...formProjeto, dataFim: e.target.value })} 
                  />
                </div>
              </div>

              <div className="form-linha">
                <div className="form-grupo">
                  <label>Meta Financeira (R$) (Opcional)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="Ex: 5000.00" 
                    value={formProjeto.metaFinanceira} 
                    onChange={e => setFormProjeto({ ...formProjeto, metaFinanceira: e.target.value })} 
                  />
                </div>

                <div className="form-grupo">
                  <label>Meta de Itens Físicos</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 100 Cestas Básicas ou 50 Cobertores" 
                    value={formProjeto.metaItens} 
                    onChange={e => setFormProjeto({ ...formProjeto, metaItens: e.target.value })} 
                  />
                </div>
              </div>

              <div className="modal-botoes">
                <button type="button" onClick={() => setModalProjetoAberto(false)} className="btn-cancelar">Cancelar</button>
                <button type="submit" className="btn-novo">Salvar Campanha</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTRAR DOAÇÃO (ITEM FÍSICO OU FINANCEIRA) */}
      {modalDoacaoAberto && projetoSelecionado && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <h2>Registrar Doação — {projetoSelecionado.titulo}</h2>
            
            <form onSubmit={salvarDoacao} className="form-membro">
              <div className="form-grupo">
                <label>Tipo de Doação *</label>
                <select 
                  value={formDoacao.tipoDoacao} 
                  onChange={e => setFormDoacao({ ...formDoacao, tipoDoacao: e.target.value })}
                >
                  <option value="ITEM">📦 Item Físico (Alimento, Agasalho, Material, etc.)</option>
                  <option value="FINANCEIRO">💰 Recurso Financeiro (R$)</option>
                </select>
              </div>

              {formDoacao.tipoDoacao === 'ITEM' ? (
                <>
                  <div className="form-linha">
                    <div className="form-grupo" style={{ flex: 2 }}>
                      <label>Descrição do Item *</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Arroz, Feijão, Cesta Básica, Cobertor" 
                        value={formDoacao.item} 
                        onChange={e => setFormDoacao({ ...formDoacao, item: e.target.value })} 
                        required 
                      />
                    </div>

                    <div className="form-grupo">
                      <label>Quantidade *</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        placeholder="Ex: 50" 
                        value={formDoacao.quantidade} 
                        onChange={e => setFormDoacao({ ...formDoacao, quantidade: e.target.value })} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-linha">
                    <div className="form-grupo">
                      <label>Unidade de Medida</label>
                      <select 
                        value={formDoacao.unidadeMedida} 
                        onChange={e => setFormDoacao({ ...formDoacao, unidadeMedida: e.target.value })}
                      >
                        <option value="Kg">Quilos (Kg)</option>
                        <option value="Unidades">Unidades / Peças</option>
                        <option value="Litros">Litros</option>
                        <option value="Fardos">Fardos / Caixas</option>
                        <option value="Sacos">Sacos</option>
                      </select>
                    </div>

                    <div className="form-grupo">
                      <label>Doador (Opcional)</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Irmão João ou Anônimo" 
                        value={formDoacao.doador} 
                        onChange={e => setFormDoacao({ ...formDoacao, doador: e.target.value })} 
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="form-linha">
                  <div className="form-grupo">
                    <label>Valor da Doação (R$) *</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      value={formDoacao.valorFinanceiro} 
                      onChange={e => setFormDoacao({ ...formDoacao, valorFinanceiro: e.target.value })} 
                      required 
                    />
                  </div>

                  <div className="form-grupo">
                    <label>Doador (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Oferta Especial de Missões" 
                      value={formDoacao.doador} 
                      onChange={e => setFormDoacao({ ...formDoacao, doador: e.target.value })} 
                    />
                  </div>
                </div>
              )}

              <div className="modal-botoes">
                <button type="button" onClick={() => setModalDoacaoAberto(false)} className="btn-cancelar">Cancelar</button>
                <button type="submit" className="btn-novo" style={{ backgroundColor: '#28a745' }}>Confirmar Doação</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTRAR ATENDIMENTO A FAMÍLIA BENEFICIADA */}
      {modalAtendimentoAberto && projetoSelecionado && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h2>Registrar Entrega / Assistência Social</h2>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
              Projeto: <strong>{projetoSelecionado.titulo}</strong>
            </p>

            <form onSubmit={salvarAtendimento} className="form-membro">
              <div className="form-linha">
                <div className="form-grupo" style={{ flex: 2 }}>
                  <label>Nome do Responsável da Família *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Maria dos Santos" 
                    value={formAtendimento.nomeResponsavel} 
                    onChange={e => setFormAtendimento({ ...formAtendimento, nomeResponsavel: e.target.value })} 
                    required 
                  />
                </div>

                <div className="form-grupo">
                  <label>Pessoas na Família</label>
                  <input 
                    type="number" 
                    value={formAtendimento.qtdPessoasFamilia} 
                    onChange={e => setFormAtendimento({ ...formAtendimento, qtdPessoasFamilia: e.target.value })} 
                    min="1" 
                  />
                </div>
              </div>

              <div className="form-grupo">
                <label>Itens / Cestas Entregues *</label>
                <input 
                  type="text" 
                  placeholder="Ex: 1 Cesta Básica Completa + 2 Cobertores" 
                  value={formAtendimento.itensEntregues} 
                  onChange={e => setFormAtendimento({ ...formAtendimento, itensEntregues: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-grupo">
                <label>Observação / Endereço (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="Ex: Moradora do Bairro Central" 
                  value={formAtendimento.observacao} 
                  onChange={e => setFormAtendimento({ ...formAtendimento, observacao: e.target.value })} 
                />
              </div>

              <div className="modal-botoes">
                <button type="button" onClick={() => setModalAtendimentoAberto(false)} className="btn-cancelar">Cancelar</button>
                <button type="submit" className="btn-novo" style={{ backgroundColor: '#003366' }}>Salvar Atendimento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: PAINEL DO CULTO DE MISSÕES / APRESENTAÇÃO NO TELÃO */}
      {modalTelaoAberto && (
        <div className="modal-overlay">
          <div className="modal-content modal-telao-print-content" style={{ maxWidth: '950px', maxHeight: '95vh', overflowY: 'auto' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
              <h3 style={{ margin: 0, color: '#003366' }}>Informativo de Missões e Ação Social</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => window.print()} 
                  style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🖨️ Imprimir / Projetar Slide em PDF
                </button>
                <button 
                  onClick={() => setModalTelaoAberto(false)} 
                  style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* LAYOUT SLIDE TELÃO */}
            <div className="relatorio-folha-impressao" style={{ padding: '25px', background: '#fff' }}>
              <div style={{ textAlign: 'center', borderBottom: '3px solid #003366', paddingBottom: '15px', marginBottom: '25px' }}>
                <h1 style={{ margin: '0 0 5px 0', color: '#003366', fontSize: '1.8rem', textTransform: 'uppercase' }}>Igreja Evangélica Assembleia de Deus</h1>
                <h2 style={{ margin: '0 0 5px 0', color: '#d4af37', fontSize: '1.3rem' }}>RELATÓRIO DE IMPACTO DE MISSÕES E AÇÃO SOCIAL</h2>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Convenção ADCESE — Prestação de Contas Transparente</p>
              </div>

              {/* DADOS DE IMPACTO EM DESTAQUE */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px', textAlign: 'center' }}>
                <div style={{ border: '2px solid #e63946', background: '#fff5f5', padding: '15px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#c53030', fontWeight: 'bold' }}>FAMÍLIAS ATENDIDAS</span>
                  <h1 style={{ margin: '5px 0 0 0', color: '#e63946', fontSize: '2.2rem' }}>{totalFamiliasAtendidas}</h1>
                </div>

                <div style={{ border: '2px solid #28a745', background: '#f0fdf4', padding: '15px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 'bold' }}>VALOR ARRECADADO</span>
                  <h1 style={{ margin: '5px 0 0 0', color: '#28a745', fontSize: '2rem' }}>{formatarMoeda(totalArrecadadoFinanceiro)}</h1>
                </div>

                <div style={{ border: '2px solid #0369a1', background: '#f0f9ff', padding: '15px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 'bold' }}>ALIMENTOS ARRECADADOS</span>
                  <h1 style={{ margin: '5px 0 0 0', color: '#0369a1', fontSize: '2rem' }}>{totalKgAlimentos} kg / {totalCestasUnidades} cestas</h1>
                </div>
              </div>

              {/* LISTA DAS CAMPANHAS EM DESTAQUE */}
              <h3 style={{ color: '#003366', borderBottom: '2px solid #d4af37', paddingBottom: '6px', marginBottom: '15px' }}>
                Projetos e Campanhas em Andamento
              </h3>

              <table className="membros-tabela" style={{ width: '100%', fontSize: '0.85rem', marginBottom: '30px' }}>
                <thead>
                  <tr>
                    <th>Projeto / Campanha</th>
                    <th>Tipo</th>
                    <th>Congregação</th>
                    <th>Coordenador</th>
                    <th>Arrecadado (R$)</th>
                    <th style={{ textAlign: 'right' }}>Famílias Atendidas</th>
                  </tr>
                </thead>
                <tbody>
                  {projetosFiltrados.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.titulo}</strong></td>
                      <td>{p.tipo}</td>
                      <td>{p.congregacao}</td>
                      <td>{p.coordenador || '-'}</td>
                      <td>{formatarMoeda(p.arrecadadoFinanceiro)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#e63946' }}>{p.qtdFamiliasAtendidas || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '40px', paddingTop: '15px', textAlign: 'center' }}>
                <div style={{ width: '40%' }}>
                  <div style={{ borderTop: '1px solid #333', paddingTop: '5px', fontSize: '0.85rem' }}>
                    <strong>Coordenador(a) de Missões e Ação Social</strong>
                  </div>
                </div>
                <div style={{ width: '40%' }}>
                  <div style={{ borderTop: '1px solid #333', paddingTop: '5px', fontSize: '0.85rem' }}>
                    <strong>Pastor Presidente / Dirigente</strong>
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

export default Projetos;
