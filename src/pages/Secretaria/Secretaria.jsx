import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import NavbarHeader from '../../components/NavbarHeader/NavbarHeader';
import ActionMenu from '../../components/ActionMenu/ActionMenu';
import { FaIdCard, FaFileAlt, FaEdit, FaTrashAlt } from 'react-icons/fa';
import './Secretaria.css';

function Secretaria() {
  // ESTADOS PRINCIPAIS DE DADOS
  const [membros, setMembros] = useState([]);
  const [todosMembrosRelatorio, setTodosMembrosRelatorio] = useState([]);
  const [congregacoes, setCongregacoes] = useState([]);
  
  // MODAIS
  const [modalAberto, setModalAberto] = useState(false);
  const [modalRelatorioAberto, setModalRelatorioAberto] = useState(false);
  const [modalDocumentoAberto, setModalDocumentoAberto] = useState(false);
  const [modalCarteirinhaAberto, setModalCarteirinhaAberto] = useState(false);
  
  // ESTADOS DE DOCUMENTOS, CERTIFICADOS E CARTEIRINHA
  const [membroSelecionadoDoc, setMembroSelecionadoDoc] = useState(null);
  const [membroSelecionadoCredencial, setMembroSelecionadoCredencial] = useState(null);
  const [tipoDocumento, setTipoDocumento] = useState('CARTA_MUDANCA'); // 'CARTA_MUDANCA', 'BATISMO', 'APRESENTACAO_CRIANCA'
  const [nomeIgrejaDestino, setNomeIgrejaDestino] = useState('');
  const [nomePaisCrianca, setNomePaisCrianca] = useState('');

  // ESTADOS DE FILTRO, BUSCA E RELATÓRIO
  const dataHoje = new Date();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroCongregacao, setFiltroCongregacao] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('');
  const [mesAniversariante, setMesAniversariante] = useState(String(dataHoje.getMonth() + 1));
  const [tipoRelatorio, setTipoRelatorio] = useState('SANTA_CEIA'); // 'SANTA_CEIA', 'ROL_GERAL', 'ANIVERSARIANTES'

  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);

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

  // FORMULÁRIO DE MEMBRO
  const estadoInicial = {
    id: null,
    chapa: '',
    nome: '',
    cpf: '',
    telefone: '',
    dataNascimento: '',
    cargo: 'Membro',
    congregacao: 'Sede',
    dataBatismo: '',
    status: 'Ativo',
    fotoUrl: '',
    observacoes: ''
  };
  
  const [dadosFormulario, setDadosFormulario] = useState(estadoInicial);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    carregarCongregacoes();
    carregarMembros();
  }, [navigate, busca, filtroStatus, pagina]);

  const carregarCongregacoes = () => {
    api.get('/congregacoes')
      .then(res => {
        const lista = Array.isArray(res.data) ? res.data : (res.data?.content || []);
        setCongregacoes(lista);
      })
      .catch(err => console.error("Erro ao carregar congregações:", err));
  };

  const carregarMembros = () => {
    const params = {
      page: pagina,
      size: 10,
      busca: busca || undefined,
      status: filtroStatus || undefined
    };

    api.get('/membros', { params })
      .then(res => {
        if (res.data && res.data.content !== undefined) {
          setMembros(res.data.content);
          setTotalPaginas(res.data.totalPages || 1);
          setTotalElementos(res.data.totalElements || 0);
        } else if (Array.isArray(res.data)) {
          setMembros(res.data);
          setTotalPaginas(1);
          setTotalElementos(res.data.length);
        }
      })
      .catch(err => console.error("Erro ao carregar membros:", err));
  };

  const carregarTodosMembrosRelatorio = () => {
    api.get('/membros')
      .then(res => {
        const lista = Array.isArray(res.data) ? res.data : (res.data?.content || []);
        setTodosMembrosRelatorio(lista);
      })
      .catch(err => console.error("Erro ao carregar todos membros para relatório:", err));
  };

  const abrirModalRelatorio = (tipo = 'SANTA_CEIA') => {
    setTipoRelatorio(tipo);
    carregarTodosMembrosRelatorio();
    setModalRelatorioAberto(true);
  };

  // UPLOAD E CONVERSÃO DA FOTO DO MEMBRO (BASE64)
  const handleFotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Por favor, escolha uma imagem menor que 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDadosFormulario(prev => ({ ...prev, fotoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const lidarComMudanca = (e) => {
    setDadosFormulario({ ...dadosFormulario, [e.target.name]: e.target.value });
  };

  const abrirModalNovo = () => {
    setDadosFormulario(estadoInicial);
    setModalAberto(true);
  };

  const abrirModalEdicao = (membro) => {
    setDadosFormulario({ ...estadoInicial, ...membro });
    setModalAberto(true);
  };

  const abrirModalDocumento = (membro) => {
    setMembroSelecionadoDoc(membro);
    setNomePaisCrianca('');
    setNomeIgrejaDestino('');
    setModalDocumentoAberto(true);
  };

  const abrirModalCarteirinha = (membro) => {
    setMembroSelecionadoCredencial(membro);
    setModalCarteirinhaAberto(true);
  };

  const salvarMembro = (e) => {
    e.preventDefault();
    
    if (dadosFormulario.id) {
      api.put(`/membros/${dadosFormulario.id}`, dadosFormulario)
        .then(() => {
          alert("Membro atualizado com sucesso!");
          setModalAberto(false);
          carregarMembros();
        })
        .catch(err => alert("Erro ao atualizar membro."));
    } else {
      api.post('/membros', dadosFormulario)
        .then(() => {
          alert("Membro cadastrado com sucesso!");
          setModalAberto(false);
          carregarMembros();
        })
        .catch(err => alert("Erro ao cadastrar membro."));
    }
  };

  const handleExcluirMembro = (membro) => {
    if (!window.confirm(`Tem certeza que deseja excluir o membro "${membro.nome}"?`)) {
      return;
    }

    api.delete(`/membros/${membro.id}`)
      .then(() => {
        alert("Membro excluído com sucesso!");
        carregarMembros();
      })
      .catch(err => {
        console.error("Erro ao excluir membro:", err);
        alert("Erro ao excluir membro.");
      });
  };

  // FILTRAGEM LOCAL DA TABELA PRINCIPAL
  const listaSeguraMembros = Array.isArray(membros) ? membros : [];

  const membrosFiltrados = listaSeguraMembros.filter(m => {
    if (filtroCongregacao && m.congregacao !== filtroCongregacao) {
      return false;
    }
    if (filtroCargo) {
      if (filtroCargo === 'Congregado' && m.cargo !== 'Congregado') return false;
      if (filtroCargo === 'Membro' && m.cargo === 'Congregado') return false;
      if (filtroCargo === 'Obreiros' && !['Pastor', 'Presbítero', 'Evangelista', 'Diácono'].includes(m.cargo)) return false;
    }
    return true;
  });

  // FILTRAGEM DE TODOS OS DADOS PARA O RELATÓRIO IMPRESSO
  const listaBaseRelatorio = todosMembrosRelatorio.length > 0 ? todosMembrosRelatorio : listaSeguraMembros;

  const obterMembrosRelatorio = () => {
    let lista = listaBaseRelatorio;

    if (filtroCongregacao && filtroCongregacao !== '') {
      lista = lista.filter(m => m.congregacao === filtroCongregacao);
    }

    if (tipoRelatorio === 'SANTA_CEIA') {
      return lista.filter(m => m.status === 'Ativo' && m.cargo !== 'Congregado');
    }
    if (tipoRelatorio === 'ANIVERSARIANTES') {
      return lista.filter(m => {
        if (!m.dataNascimento) return false;
        const partes = m.dataNascimento.split('-');
        return partes.length === 3 && String(parseInt(partes[1], 10)) === mesAniversariante;
      });
    }
    return lista;
  };

  const membrosRelatorio = obterMembrosRelatorio();

  const obterIniciais = (nome) => {
    if (!nome) return 'M';
    const partes = nome.trim().split(' ');
    if (partes.length >= 2) {
      return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
    }
    return nome.slice(0, 2).toUpperCase();
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    const partes = dataStr.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : dataStr;
  };

  return (
    <div className="secretaria-wrapper">
      <NavbarHeader 
        tituloModulo="Secretaria e Rol de Membros"
        descricaoModulo={`Gestão do Rol de Membros, Credenciais com QR Code, Aniversariantes e Emissão de Certidões (${totalElementos} cadastrados)`}
        botoesAcao={
          <>
            <button 
              onClick={() => abrirModalRelatorio('ANIVERSARIANTES')}
              style={{ backgroundColor: '#d4af37', color: '#002244', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              🎂 Aniversariantes do Mês
            </button>
            <button 
              onClick={() => abrirModalRelatorio('SANTA_CEIA')} 
              style={{ backgroundColor: '#003366', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              📄 Relatório / Rol de Membros
            </button>
            <button onClick={abrirModalNovo} className="btn-novo">➕ Novo Membro</button>
          </>
        }
      />

      <div className="secretaria-container">

      {/* PAINEL DE FILTROS E BUSCA AVANÇADA */}
      <div className="filtros-container" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', background: 'white', padding: '18px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <input 
          type="text"
          placeholder="🔍 Pesquisar por Nome, Chapa ou CPF..."
          value={busca}
          onChange={e => { setBusca(e.target.value); setPagina(0); }}
          style={{ flex: '2', minWidth: '240px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
        />

        <select 
          value={filtroStatus} 
          onChange={e => { setFiltroStatus(e.target.value); setPagina(0); }}
          style={{ flex: '1', minWidth: '150px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
        >
          <option value="">Todos os Status</option>
          <option value="Ativo">🟢 Apenas Ativos</option>
          <option value="Inativo">🔴 Apenas Inativos</option>
          <option value="Disciplina">⚠️ Em Disciplina</option>
          <option value="Transferido">✈️ Transferidos</option>
          <option value="Falecido">✝️ Falecidos</option>
        </select>

        <select
          value={filtroCongregacao}
          onChange={e => setFiltroCongregacao(e.target.value)}
          style={{ flex: '1', minWidth: '170px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
        >
          <option value="">Todas as Congregações</option>
          <option value="Sede">Congregação Sede</option>
          {congregacoes.map(c => (
            <option key={c.id} value={c.nome}>{c.nome}</option>
          ))}
        </select>

        <select
          value={filtroCargo}
          onChange={e => setFiltroCargo(e.target.value)}
          style={{ flex: '1', minWidth: '150px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
        >
          <option value="">Todas as Categorias</option>
          <option value="Membro">Membros Oficiais</option>
          <option value="Congregado">Congregados</option>
          <option value="Obreiros">Obreiros / Pastores</option>
        </select>

        {(busca || filtroStatus || filtroCongregacao || filtroCargo) && (
          <button
            onClick={() => { setBusca(''); setFiltroStatus(''); setFiltroCongregacao(''); setFiltroCargo(''); setPagina(0); }}
            style={{ padding: '10px 15px', backgroundColor: '#f8f9fa', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', color: '#555' }}
          >
            🔄 Limpar Filtros
          </button>
        )}
      </div>

      <main className="tabela-container">
        {membrosFiltrados.length === 0 ? (
          <p className="msg-vazia">Nenhum membro encontrado com os filtros selecionados.</p>
        ) : (
          <>
            <table className="membros-tabela">
              <thead>
                <tr>
                  <th>Membro</th>
                  <th>Chapa</th>
                  <th>Congregação</th>
                  <th>Cargo / Função</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center', width: '60px' }}></th>
                </tr>
              </thead>
              <tbody>
                {membrosFiltrados.map(membro => (
                  <tr key={membro.id}>
                    <td>
                      <div className="membro-info-col">
                        {membro.fotoUrl ? (
                          <img src={membro.fotoUrl} alt={membro.nome} className="membro-avatar-thumb" />
                        ) : (
                          <div className="membro-avatar-placeholder">
                            {obterIniciais(membro.nome)}
                          </div>
                        )}
                        <div>
                          <strong>{membro.nome}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>CPF: {membro.cpf || 'Não informado'}</div>
                        </div>
                      </div>
                    </td>
                    <td><strong>{membro.chapa || '-'}</strong></td>
                    <td>{membro.congregacao || 'Sede'}</td>
                    <td>{membro.cargo || 'Membro'}</td>
                    <td>{membro.telefone || '-'}</td>
                    <td>
                      <span className={`status-badge ${membro.status ? membro.status.toLowerCase() : ''}`}>
                        {membro.status || 'Ativo'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <ActionMenu actions={[
                        { label: 'Credencial / Crachá', icon: <FaIdCard />, onClick: () => abrirModalCarteirinha(membro) },
                        { label: 'Emitir Documentos', icon: <FaFileAlt />, onClick: () => abrirModalDocumento(membro) },
                        { label: 'Editar Membro', icon: <FaEdit />, onClick: () => abrirModalEdicao(membro) },
                        { label: 'Excluir Membro', icon: <FaTrashAlt />, danger: true, onClick: () => handleExcluirMembro(membro) },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINAÇÃO */}
            <div className="paginacao-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', padding: '10px 0' }}>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>Página {pagina + 1} de {totalPaginas}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  disabled={pagina === 0} 
                  onClick={() => setPagina(pagina - 1)}
                  style={{ padding: '6px 12px', cursor: pagina === 0 ? 'not-allowed' : 'pointer', opacity: pagina === 0 ? 0.5 : 1 }}
                >
                  Anterior
                </button>
                <button 
                  disabled={pagina >= totalPaginas - 1} 
                  onClick={() => setPagina(pagina + 1)}
                  style={{ padding: '6px 12px', cursor: pagina >= totalPaginas - 1 ? 'not-allowed' : 'pointer', opacity: pagina >= totalPaginas - 1 ? 0.5 : 1 }}
                >
                  Próxima
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>{dadosFormulario.id ? 'Editar Membro' : 'Novo Membro / Congregado'}</h2>
            <form onSubmit={salvarMembro} className="form-membro">
              
              {/* UPLOAD DA FOTO DO MEMBRO */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                {dadosFormulario.fotoUrl ? (
                  <img src={dadosFormulario.fotoUrl} alt="Foto do Membro" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #003366' }} />
                ) : (
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#003366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.4rem' }}>
                    📷
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#003366' }}>Foto do Membro (Upload):</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFotoUpload}
                    style={{ fontSize: '0.85rem' }}
                  />
                  {dadosFormulario.fotoUrl && (
                    <button
                      type="button"
                      onClick={() => setDadosFormulario(prev => ({ ...prev, fotoUrl: '' }))}
                      style={{ background: 'none', border: 'none', color: '#dc3545', fontSize: '0.8rem', cursor: 'pointer', display: 'block', marginTop: '5px' }}
                    >
                      ❌ Remover foto
                    </button>
                  )}
                </div>
              </div>

              <div className="form-linha">
                <div className="form-grupo">
                  <label>Chapa / Código *</label>
                  <input 
                    type="text" 
                    name="chapa" 
                    value={dadosFormulario.chapa || ''} 
                    onChange={lidarComMudanca} 
                    placeholder="Ex: M-001" 
                    required 
                  />
                </div>
                <div className="form-grupo" style={{ flex: 2 }}>
                  <label>Nome Completo *</label>
                  <input 
                    type="text" 
                    name="nome" 
                    value={dadosFormulario.nome || ''} 
                    onChange={lidarComMudanca} 
                    placeholder="Ex: João da Silva" 
                    required 
                  />
                </div>
              </div>

              <div className="form-linha">
                <div className="form-grupo">
                  <label>CPF</label>
                  <input 
                    type="text" 
                    name="cpf" 
                    value={dadosFormulario.cpf || ''} 
                    onChange={lidarComMudanca} 
                    placeholder="000.000.000-00" 
                  />
                </div>
                <div className="form-grupo">
                  <label>Telefone / WhatsApp</label>
                  <input 
                    type="text" 
                    name="telefone" 
                    value={dadosFormulario.telefone || ''} 
                    onChange={lidarComMudanca} 
                    placeholder="(00) 00000-0000" 
                  />
                </div>
              </div>

              <div className="form-linha">
                <div className="form-grupo">
                  <label>Data de Nascimento</label>
                  <input 
                    type="date" 
                    name="dataNascimento" 
                    value={dadosFormulario.dataNascimento || ''} 
                    onChange={lidarComMudanca} 
                  />
                </div>
                <div className="form-grupo">
                  <label>Data de Batismo nas Águas</label>
                  <input 
                    type="date" 
                    name="dataBatismo" 
                    value={dadosFormulario.dataBatismo || ''} 
                    onChange={lidarComMudanca} 
                  />
                </div>
              </div>

              <div className="form-linha">
                <div className="form-grupo">
                  <label>Cargo / Função Eclesiástica</label>
                  <select name="cargo" value={dadosFormulario.cargo || 'Membro'} onChange={lidarComMudanca}>
                    <option value="Membro">Membro</option>
                    <option value="Congregado">Congregado</option>
                    <option value="Diácono">Diácono</option>
                    <option value="Diaconisa">Diaconisa</option>
                    <option value="Presbítero">Presbítero</option>
                    <option value="Evangelista">Evangelista</option>
                    <option value="Pastor">Pastor</option>
                    <option value="Missionário(a)">Missionário(a)</option>
                    <option value="Auxiliar">Auxiliar de Trabalho</option>
                  </select>
                </div>

                <div className="form-grupo">
                  <label>Congregação *</label>
                  <select name="congregacao" value={dadosFormulario.congregacao || 'Sede'} onChange={lidarComMudanca}>
                    <option value="Sede">Congregação Sede</option>
                    {congregacoes.map(c => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="form-grupo">
                  <label>Status no Rol *</label>
                  <select name="status" value={dadosFormulario.status || 'Ativo'} onChange={lidarComMudanca}>
                    <option value="Ativo">🟢 Ativo em Comunhão</option>
                    <option value="Inativo">🔴 Inativo</option>
                    <option value="Disciplina">⚠️ Em Disciplina</option>
                    <option value="Transferido">✈️ Transferido</option>
                    <option value="Falecido">✝️ Falecido</option>
                  </select>
                </div>
              </div>

              {/* OBSERVAÇÕES PASTORAIS E HISTÓRICO ECLESIÁSTICO */}
              <div className="form-grupo">
                <label>📝 Observações Pastorais / Histórico Eclesiástico:</label>
                <textarea 
                  name="observacoes"
                  rows="3"
                  value={dadosFormulario.observacoes || ''}
                  onChange={lidarComMudanca}
                  placeholder="Ex: Recebido por carta de mudança em 12/03/2024. Atua na equipe de louvor..."
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', fontFamily: 'inherit' }}
                />
              </div>

              <div className="modal-botoes">
                <button type="button" onClick={() => setModalAberto(false)} className="btn-cancelar">Cancelar</button>
                <button type="submit" className="btn-novo">Salvar Membro</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL DE IMPRESSÃO / RELATÓRIO DO ROL, SANTA CEIA OU ANIVERSARIANTES COM FILTRO DE CONGREGAÇÃO */}
      {modalRelatorioAberto && (
        <div className="modal-overlay">
          <div className="modal-content modal-relatorio-content" style={{ maxWidth: '900px', maxHeight: '95vh', overflowY: 'auto' }}>
            <div className="relatorio-acoes-topo no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, color: '#003366' }}>Relatório da Secretaria</h3>
                
                {/* SELECT TIPO DE RELATÓRIO */}
                <select 
                  value={tipoRelatorio} 
                  onChange={e => setTipoRelatorio(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ccc', fontWeight: 'bold' }}
                >
                  <option value="SANTA_CEIA">🍷 Lista para Santa Ceia (Membros Ativos)</option>
                  <option value="ROL_GERAL">📋 Rol Geral Completo</option>
                  <option value="ANIVERSARIANTES">🎂 Aniversariantes do Mês</option>
                </select>

                {/* SELECT FILTRO DE CONGREGAÇÃO NO PRÓPRIO RELATÓRIO */}
                <select 
                  value={filtroCongregacao}
                  onChange={e => setFiltroCongregacao(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #003366', fontWeight: 'bold', color: '#003366', background: '#f0f7ff' }}
                >
                  <option value="">🏢 Todas as Congregações (Consolidado)</option>
                  <option value="Sede">Congregação Sede</option>
                  {congregacoes.map(c => (
                    <option key={c.id} value={c.nome}>{c.nome}</option>
                  ))}
                </select>

                {tipoRelatorio === 'ANIVERSARIANTES' && (
                  <select 
                    value={mesAniversariante}
                    onChange={e => setMesAniversariante(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ccc', fontWeight: 'bold' }}
                  >
                    {mesesNomes.map(m => (
                      <option key={m.valor} value={m.valor}>Aniversariantes de {m.nome}</option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => window.print()} 
                  style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🖨️ Imprimir / Salvar PDF
                </button>
                <button 
                  onClick={() => setModalRelatorioAberto(false)} 
                  style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* ÁREA IMPRESSA DO RELATÓRIO */}
            <div className="relatorio-folha-impressao">
              <div className="relatorio-header-oficial" style={{ textAlign: 'center', borderBottom: '2px solid #003366', paddingBottom: '15px', marginBottom: '20px' }}>
                <h1 style={{ margin: '0 0 5px 0', color: '#003366', fontSize: '1.6rem', textTransform: 'uppercase' }}>Igreja Evangélica Assembleia de Deus</h1>
                <h3 style={{ margin: '0 0 5px 0', color: '#555', fontSize: '1.1rem' }}>
                  {tipoRelatorio === 'SANTA_CEIA' && '🍷 LISTA OFICIAL DE MEMBROS HABILITADOS PARA A SANTA CEIA'}
                  {tipoRelatorio === 'ANIVERSARIANTES' && `🎂 LISTA DE ANIVERSARIANTES DO MÊS DE ${mesesNomes.find(m => m.valor === mesAniversariante)?.nome.toUpperCase()}`}
                  {tipoRelatorio === 'ROL_GERAL' && '📋 ROL GERAL DE MEMBROS E CONGREGADOS'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#777' }}>Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '0.9rem', background: '#f8fafc', padding: '10px 15px', borderRadius: '6px' }}>
                <span><strong>Total de Registros:</strong> {membrosRelatorio.length}</span>
                <span><strong>Congregação:</strong> {filtroCongregacao || 'Todas (Consolidado)'}</span>
              </div>

              <table className="membros-tabela" style={{ width: '100%', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Chapa</th>
                    <th>Nome Completo</th>
                    <th>Cargo / Função</th>
                    <th>Congregação</th>
                    {tipoRelatorio === 'ANIVERSARIANTES' ? (
                      <>
                        <th>Data de Nascimento</th>
                        <th>Telefone / Contato</th>
                      </>
                    ) : tipoRelatorio === 'SANTA_CEIA' ? (
                      <>
                        <th>Status</th>
                        <th style={{ textAlign: 'center', width: '150px' }}>Assinatura / Presença</th>
                      </>
                    ) : (
                      <>
                        <th>Status</th>
                        <th>Telefone / Contato</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {membrosRelatorio.map(membro => (
                    <tr key={membro.id}>
                      <td><strong>{membro.chapa || '-'}</strong></td>
                      <td>{membro.nome}</td>
                      <td>{membro.cargo || 'Membro'}</td>
                      <td>{membro.congregacao || 'Sede'}</td>
                      {tipoRelatorio === 'ANIVERSARIANTES' ? (
                        <>
                          <td><strong>🎂 {formatarData(membro.dataNascimento)}</strong></td>
                          <td>{membro.telefone || '-'}</td>
                        </>
                      ) : tipoRelatorio === 'SANTA_CEIA' ? (
                        <>
                          <td>{membro.status || 'Ativo'}</td>
                          <td style={{ textAlign: 'center', borderBottom: '1px dotted #999' }}>[ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]</td>
                        </>
                      ) : (
                        <>
                          <td>{membro.status || 'Ativo'}</td>
                          <td>{membro.telefone || '-'}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="relatorio-assinaturas" style={{ display: 'flex', justifyContent: 'space-around', marginTop: '60px', paddingTop: '20px', textAlign: 'center' }}>
                <div style={{ width: '40%' }}>
                  <div style={{ borderTop: '1px solid #333', paddingTop: '5px' }}>
                    <strong>Secretário(a) da Igreja</strong>
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

      {/* MODAL DE IMPRESSÃO DE CARTEIRINHA / CREDENCIAL DE MEMBRO */}
      {modalCarteirinhaAberto && membroSelecionadoCredencial && (
        <div className="modal-overlay">
          <div className="modal-content modal-documento-content" style={{ maxWidth: '550px' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
              <h3 style={{ margin: 0, color: '#003366' }}>Credencial / Carteirinha de Membro</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => window.print()} 
                  style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🖨️ Imprimir PDF
                </button>
                <button 
                  onClick={() => setModalCarteirinhaAberto(false)} 
                  style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* CARTÃO IMPRESSO DA CREDENCIAL */}
            <div className="carteirinha-card">
              <div className="carteirinha-header-sub">
                <h2>Conecta ADCESE</h2>
                <span>CREDENCIAL DE MEMBRO</span>
              </div>

              <div className="carteirinha-corpo-grid">
                {membroSelecionadoCredencial.fotoUrl ? (
                  <img src={membroSelecionadoCredencial.fotoUrl} alt={membroSelecionadoCredencial.nome} className="carteirinha-foto" />
                ) : (
                  <div className="carteirinha-foto-placeholder">
                    {obterIniciais(membroSelecionadoCredencial.nome)}
                  </div>
                )}

                <div className="carteirinha-dados">
                  <p style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase' }}>
                    {membroSelecionadoCredencial.nome}
                  </p>
                  <p>Chapa: <strong>{membroSelecionadoCredencial.chapa || 'M-000'}</strong></p>
                  <p>Cargo: <strong>{membroSelecionadoCredencial.cargo || 'Membro'}</strong></p>
                  <p>Congregação: <strong>{membroSelecionadoCredencial.congregacao || 'Sede'}</strong></p>
                  <p>Batismo: <strong>{formatarData(membroSelecionadoCredencial.dataBatismo)}</strong></p>
                </div>
              </div>

              <div className="carteirinha-footer">
                <div>
                  <div style={{ borderTop: '1px solid #d4af37', width: '120px', textAlign: 'center', marginBottom: '2px' }}></div>
                  <span>Pastor Presidente</span>
                </div>
                <div className="carteirinha-qr">
                  <span style={{ fontSize: '0.65rem', color: '#002244', fontWeight: 'bold', textAlign: 'center', lineHeight: '1' }}>
                    QR CODE<br/>VALID
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE EMISSÃO DE CARTAS E CERTIFICADOS OFICIAIS */}
      {modalDocumentoAberto && membroSelecionadoDoc && (
        <div className="modal-overlay">
          <div className="modal-content modal-documento-content" style={{ maxWidth: '850px', maxHeight: '95vh', overflowY: 'auto' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#003366' }}>Emissão de Documento Eclesiástico</h3>
                <select 
                  value={tipoDocumento} 
                  onChange={e => setTipoDocumento(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ccc', fontWeight: 'bold' }}
                >
                  <option value="CARTA_MUDANCA">📜 Carta de Mudança / Recomendação</option>
                  <option value="BATISMO">🎓 Certificado de Batismo nas Águas</option>
                  <option value="APRESENTACAO_CRIANCA">👶 Certificado de Apresentação de Criança</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => window.print()} 
                  style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🖨️ Imprimir / Salvar PDF
                </button>
                <button 
                  onClick={() => setModalDocumentoAberto(false)} 
                  style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* CAMPOS ADICIONAIS CONFORME O TIPO DE DOCUMENTO */}
            <div className="no-print" style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
              {tipoDocumento === 'CARTA_MUDANCA' && (
                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#003366' }}>Nome da Igreja de Destino / Cidade:</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Assembleia de Deus em Feira de Santana - BA" 
                    value={nomeIgrejaDestino}
                    onChange={e => setNomeIgrejaDestino(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '5px' }}
                  />
                </div>
              )}

              {tipoDocumento === 'APRESENTACAO_CRIANCA' && (
                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#003366' }}>Nome dos Pais da Criança:</label>
                  <input 
                    type="text" 
                    placeholder="Ex: José da Silva e Maria da Silva" 
                    value={nomePaisCrianca}
                    onChange={e => setNomePaisCrianca(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '5px' }}
                  />
                </div>
              )}
            </div>

            {/* CORPO IMPRESSO DO CERTIFICADO / CARTA */}
            <div className="certificado-moldura">
              
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h1 style={{ color: '#003366', margin: '0 0 5px 0', fontSize: '1.8rem', textTransform: 'uppercase' }}>Igreja Evangélica Assembleia de Deus</h1>
                <h4 style={{ color: '#d4af37', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>Convenção ADCESE — Santo Estevão - BA</h4>
              </div>

              {tipoDocumento === 'CARTA_MUDANCA' && (
                <>
                  <div className="certificado-titulo">Carta de Recomendação e Mudança</div>
                  <div className="certificado-corpo">
                    <p>Recomendamos ao amor cristão da amada Igreja <strong>{nomeIgrejaDestino || '[Igreja de Destino]'}</strong> o(a) nosso(a) irmão(ã) em Cristo <strong>{membroSelecionadoDoc.nome}</strong>, portador(a) da Chapa nº <strong>{membroSelecionadoDoc.chapa || 'S/N'}</strong> e CPF <strong>{membroSelecionadoDoc.cpf || 'Não informado'}</strong>, que exercia nesta igreja a função de <strong>{membroSelecionadoDoc.cargo || 'Membro'}</strong>.</p>
                    <p>Declaramos que o(a) referido(a) irmão(ã) acha-se em plena comunhão com esta igreja e com a Palavra de Deus, não constando nada contra sua conduta moral ou eclesiástica.</p>
                    <p>Solicitamos que o(a) recebais no Senhor como convém aos santos.</p>
                  </div>
                </>
              )}

              {tipoDocumento === 'BATISMO' && (
                <>
                  <div className="certificado-titulo">Certificado de Batismo nas Águas</div>
                  <div className="certificado-corpo">
                    <p>Certificamos que o(a) irmão(ã) <strong>{membroSelecionadoDoc.nome}</strong>, registrado(a) sob a Chapa nº <strong>{membroSelecionadoDoc.chapa || 'S/N'}</strong>, professou publicamente a sua fé no Senhor Jesus Cristo e foi batizado(a) nas águas em <strong>{formatarData(membroSelecionadoDoc.dataBatismo) || new Date().toLocaleDateString('pt-BR')}</strong>, em obediência ao mandamento de Nosso Senhor Jesus Cristo (Mateus 28:19).</p>
                    <p style={{ textAlign: 'center', fontStyle: 'italic', marginTop: '20px' }}>
                      "Fomos, pois, sepultados com ele pelo batismo na morte; para que, como Cristo foi ressuscitado dentre os mortos, assim andemos nós também em novidade de vida." — Romanos 6:4
                    </p>
                  </div>
                </>
              )}

              {tipoDocumento === 'APRESENTACAO_CRIANCA' && (
                <>
                  <div className="certificado-titulo">Certificado de Apresentação de Criança</div>
                  <div className="certificado-corpo">
                    <p>Certificamos que a criança <strong>{membroSelecionadoDoc.nome}</strong>, filho(a) de <strong>{nomePaisCrianca || '[Nome dos Pais]'}</strong>, foi apresentada ao Senhor no templo desta igreja nesta data, conforme o costume bíblico, sendo invocada sobre ela a bênção do Deus Todo-Poderoso (Lucas 2:22).</p>
                  </div>
                </>
              )}

              <div style={{ margin: '30px 0', fontSize: '0.95rem', color: '#555' }}>
                Santo Estevão - BA, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.
              </div>

              <div className="relatorio-assinaturas" style={{ display: 'flex', justifyContent: 'space-around', marginTop: '50px', paddingTop: '20px', textAlign: 'center' }}>
                <div style={{ width: '40%' }}>
                  <div style={{ borderTop: '1px solid #003366', paddingTop: '5px' }}>
                    <strong>Pastor Presidente / Dirigente</strong>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Assembleia de Deus ADCESE</div>
                  </div>
                </div>
                <div style={{ width: '40%' }}>
                  <div style={{ borderTop: '1px solid #003366', paddingTop: '5px' }}>
                    <strong>Secretário(a) Geral</strong>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Conecta ADCESE</div>
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

export default Secretaria;