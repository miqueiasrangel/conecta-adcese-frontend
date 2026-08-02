import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import NavbarHeader from '../../components/NavbarHeader/NavbarHeader';
import ActionMenu from '../../components/ActionMenu/ActionMenu';
import { FaUserFriends, FaEdit, FaTrashAlt } from 'react-icons/fa';
import '../Secretaria/Secretaria.css';
import './Cultos.css';

function Cultos() {
  const dataHoje = new Date();

  // ESTADOS DE DADOS
  const [cultos, setCultos] = useState([]);
  const [congregacoes, setCongregacoes] = useState([]);
  const [membros, setMembros] = useState([]);

  // ESTADOS DE FILTRO E VISUALIZAÇÃO
  const [modoExibicao, setModoExibicao] = useState('LISTA'); // 'LISTA' ou 'CALENDARIO'
  const [mesFiltro, setMesFiltro] = useState(String(dataHoje.getMonth() + 1));
  const [anoFiltro, setAnoFiltro] = useState(String(dataHoje.getFullYear()));
  const [congregacaoFiltro, setCongregacaoFiltro] = useState('TODAS');

  // MODAIS
  const [modalCultoAberto, setModalCultoAberto] = useState(false);
  const [modalEscalaAberto, setModalEscalaAberto] = useState(false);
  const [modalMetricasAberto, setModalMetricasAberto] = useState(false);
  const [modalExportarEscalaAberto, setModalExportarEscalaAberto] = useState(false);
  const [modalImprimirCalendarioAberto, setModalImprimirCalendarioAberto] = useState(false);

  // ALERTA DE CONFLITO
  const [mensagemConflito, setMensagemConflito] = useState('');

  // SELEÇÕES
  const [cultoSelecionado, setCultoSelecionado] = useState(null);

  // FORMULÁRIO DE CULTO
  const estadoInicialCulto = {
    id: null,
    data: new Date().toISOString().split('T')[0],
    horarioInicio: '19:00',
    horarioFim: '21:00',
    congregacao: 'Sede',
    tipoCulto: 'Culto de Domingo',
    preletor: '',
    tema: '',
    hinosHarpa: 'Harpa nº 15 e nº 115',
    status: 'Agendado',
    qtdMembros: 0,
    qtdVisitantes: 0,
    qtdCriancas: 0,
    decisoesAlmas: 0
  };

  const [formCulto, setFormCulto] = useState(estadoInicialCulto);

  // FORMULÁRIO DE ESCALA
  const [formEscala, setFormEscala] = useState({
    departamento: 'Louvor',
    membroId: '',
    nomeVisitante: '',
    funcao: 'Vocal'
  });

  // FORMULÁRIO DE MÉTRICAS PÓS-CULTO
  const [formMetricas, setFormMetricas] = useState({
    qtdMembros: 0,
    qtdVisitantes: 0,
    qtdCriancas: 0,
    decisoesAlmas: 0
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

  const tiposCultoOpcoes = [
    'Culto de Domingo',
    'Culto de Ensino',
    'Culto de Missões',
    'Santa Ceia',
    'Círculo de Oração',
    'Consagração',
    'Festividade / Evento Especial'
  ];

  const departamentosOpcoes = [
    { nome: 'Louvor / Banda', funcoes: ['Vocal', 'Bateria', 'Teclado', 'Baixo', 'Violão', 'Guitarra', 'Ministro de Louvor'] },
    { nome: 'Recepção / Portaria', funcoes: ['Portaria Principal', 'Recepção de Visitantes', 'Estacionamento'] },
    { nome: 'Diaconato / Ordem', funcoes: ['Ordem do Culto', 'Serviço da Santa Ceia', 'Recolhimento de Ofertas'] },
    { nome: 'Mídia / Projeção', funcoes: ['Mesa de Som', 'Projeção de Letras', 'Transmissão Ao Vivo', 'Fotografia'] },
    { nome: 'Ministério Infantil', funcoes: ['Professora / Recreadora', 'Apoio Infantil', 'Lanche'] }
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
    api.get('/cultos')
      .then(res => {
        const lista = Array.isArray(res.data) ? res.data : (res.data?.content || []);
        setCultos(lista);
      })
      .catch(err => console.error("Erro ao carregar cultos:", err));

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

  const extrairMesEAno = (dataStr) => {
    if (!dataStr) return { mes: '', ano: '' };
    const partes = dataStr.split('-');
    return partes.length === 3
      ? { ano: partes[0], mes: String(parseInt(partes[1], 10)) }
      : { mes: '', ano: '' };
  };

  // FILTRAGEM DE CULTOS
  const listaSeguraCultos = Array.isArray(cultos) ? cultos : [];

  const cultosFiltrados = listaSeguraCultos.filter(c => {
    if (congregacaoFiltro !== 'TODAS' && c.congregacao !== congregacaoFiltro) {
      return false;
    }
    const { mes, ano } = extrairMesEAno(c.data);
    if (mesFiltro !== 'TODOS' && mes !== mesFiltro) {
      return false;
    }
    if (anoFiltro !== 'TODOS' && ano !== anoFiltro) {
      return false;
    }
    return true;
  });

  // SALVAR NOVO CULTO OU EDITAR CULTO
  const salvarCulto = (e) => {
    e.preventDefault();
    if (formCulto.id) {
      api.put(`/cultos/${formCulto.id}`, formCulto)
        .then(() => {
          alert("Culto atualizado com sucesso!");
          setModalCultoAberto(false);
          carregarDados();
        })
        .catch(err => alert("Erro ao atualizar culto."));
    } else {
      api.post('/cultos', formCulto)
        .then(() => {
          alert("Culto agendado com sucesso!");
          setModalCultoAberto(false);
          carregarDados();
        })
        .catch(err => alert("Erro ao agendar culto."));
    }
  };

  const deletarCulto = (id) => {
    if (window.confirm("Deseja realmente excluir este culto?")) {
      api.delete(`/cultos/${id}`)
        .then(() => {
          alert("Culto excluído com sucesso!");
          carregarDados();
        })
        .catch(err => console.error("Erro ao excluir culto", err));
    }
  };

  // ESCALAR MEMBRO COM PREVENÇÃO DE CONFLITOS SÊNIOR
  const abrirModalEscalar = (culto) => {
    setCultoSelecionado(culto);
    setMensagemConflito('');
    setFormEscala({ departamento: 'Louvor', membroId: '', nomeVisitante: '', funcao: 'Vocal' });
    setModalEscalaAberto(true);
  };

  const adicionarEscalado = (e) => {
    e.preventDefault();
    if (!cultoSelecionado) return;

    let membroObj = null;
    let nomeEscalado = formEscala.nomeVisitante;

    if (formEscala.membroId) {
      membroObj = membros.find(m => String(m.id) === String(formEscala.membroId));
      if (membroObj) nomeEscalado = membroObj.nome;
    }

    if (!nomeEscalado) {
      alert("Por favor, selecione um membro da igreja ou informe o nome.");
      return;
    }

    // PREVENÇÃO DE CONFLITOS (REGRA SÊNIOR)
    const escaladosAtuais = cultoSelecionado.escalados || [];
    const conflitoExistente = escaladosAtuais.find(item => {
      if (membroObj && item.membro && String(item.membro.id) === String(membroObj.id)) {
        return true;
      }
      if (item.nomeMembro && item.nomeMembro.trim().toLowerCase() === nomeEscalado.trim().toLowerCase()) {
        return true;
      }
      return false;
    });

    if (conflitoExistente) {
      setMensagemConflito(`⚠️ CONFLITO DE ESCALA! O irmão(ã) "${nomeEscalado}" já está escalado(a) neste mesmo culto no departamento "${conflitoExistente.departamento}" como "${conflitoExistente.funcao}".`);
      return;
    }

    const novoItem = {
      membro: membroObj ? { id: membroObj.id } : null,
      nomeMembro: nomeEscalado,
      departamento: formEscala.departamento,
      funcao: formEscala.funcao
    };

    api.post(`/cultos/${cultoSelecionado.id}/escalar`, novoItem)
      .then(res => {
        setMensagemConflito('');
        setCultoSelecionado(res.data);
        carregarDados();
        alert(`"${nomeEscalado}" escalado(a) com sucesso no departamento ${formEscala.departamento}!`);
      })
      .catch(err => {
        console.error("Erro ao escalar", err);
        alert(err.response?.data || "Erro ao escalar membro.");
      });
  };

  const removerEscaladoDoCulto = (escalaId) => {
    if (!cultoSelecionado) return;
    const novosEscalados = cultoSelecionado.escalados.filter(item => item.id !== escalaId);
    const cultoAtualizado = { ...cultoSelecionado, escalados: novosEscalados };

    api.put(`/cultos/${cultoSelecionado.id}`, cultoAtualizado)
      .then(res => {
        setCultoSelecionado(res.data);
        carregarDados();
      })
      .catch(err => console.error("Erro ao remover escalado:", err));
  };

  // SALVAR MÉTRICAS PÓS-CULTO
  const abrirModalMetricas = (culto) => {
    setCultoSelecionado(culto);
    setFormMetricas({
      qtdMembros: culto.qtdMembros || 0,
      qtdVisitantes: culto.qtdVisitantes || 0,
      qtdCriancas: culto.qtdCriancas || 0,
      decisoesAlmas: culto.decisoesAlmas || 0
    });
    setModalMetricasAberto(true);
  };

  const salvarMetricas = (e) => {
    e.preventDefault();
    if (!cultoSelecionado) return;

    const cultoAtualizado = {
      ...cultoSelecionado,
      qtdMembros: parseInt(formMetricas.qtdMembros) || 0,
      qtdVisitantes: parseInt(formMetricas.qtdVisitantes) || 0,
      qtdCriancas: parseInt(formMetricas.qtdCriancas) || 0,
      decisoesAlmas: parseInt(formMetricas.decisoesAlmas) || 0,
      status: 'Concluído'
    };

    api.put(`/cultos/${cultoSelecionado.id}`, cultoAtualizado)
      .then(() => {
        alert("Métricas do culto registradas com sucesso!");
        setModalMetricasAberto(false);
        carregarDados();
      })
      .catch(err => alert("Erro ao salvar métricas."));
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    const partes = dataStr.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : dataStr;
  };

  // MONTAGEM DO CALENDÁRIO MENSAL
  const obterDiasDoCalendario = () => {
    const ano = parseInt(anoFiltro) || dataHoje.getFullYear();
    const mes = (parseInt(mesFiltro) || (dataHoje.getMonth() + 1)) - 1;

    const primeiroDiaMes = new Date(ano, mes, 1);
    const ultimoDiaMes = new Date(ano, mes + 1, 0);

    const diaSemanaInicio = primeiroDiaMes.getDay(); // 0 = Domingo
    const totalDiasMes = ultimoDiaMes.getDate();

    const diasGrid = [];

    // Preenche dias do mês anterior
    for (let i = 0; i < diaSemanaInicio; i++) {
      diasGrid.push({ dia: '', outroMes: true });
    }

    // Dias do mês atual
    for (let d = 1; d <= totalDiasMes; d++) {
      const dataFormatada = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const cultosNoDia = cultosFiltrados.filter(c => c.data === dataFormatada);
      const eHoje = d === dataHoje.getDate() && mes === dataHoje.getMonth() && ano === dataHoje.getFullYear();
      diasGrid.push({ dia: d, dataStr: dataFormatada, cultos: cultosNoDia, hoje: eHoje });
    }

    return diasGrid;
  };

  const diasCalendario = obterDiasDoCalendario();

  return (
    <div className="cultos-wrapper">
      <NavbarHeader 
        tituloModulo="Gestão de Cultos e Escalas"
        descricaoModulo="Liturgia, Organização de Equipes por Departamento e Calendário Mensal"
        botoesAcao={
          <>
            <button 
              onClick={() => setModalImprimirCalendarioAberto(true)} 
              style={{ backgroundColor: '#d4af37', color: '#002244', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              🗓️ Imprimir Calendário
            </button>
            <button 
              onClick={() => setModalExportarEscalaAberto(true)} 
              style={{ backgroundColor: '#003366', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              📄 Exportar Escala em PDF
            </button>
            <button 
              onClick={() => { setFormCulto(estadoInicialCulto); setModalCultoAberto(true); }} 
              className="btn-novo"
            >
              ➕ Agendar Novo Culto
            </button>
          </>
        }
      />

      <div className="cultos-container">

      {/* CARD DE RESUMO */}
      <section className="metricas-grid-cultos" style={{ gridTemplateColumns: '1fr' }}>
        <div className="metricas-card-culto cultos">
          <span>Cultos Programados no Período</span>
          <h2>{cultosFiltrados.length} culto(s)</h2>
        </div>
      </section>

      {/* BARRA DE FILTROS E SELETOR DE MODO DE VISUALIZAÇÃO */}
      <section className="controles-culto-bar">
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="filtro-grupo">
            <label>🏢 Congregação:</label>
            <select value={congregacaoFiltro} onChange={e => setCongregacaoFiltro(e.target.value)} className="filtro-select">
              <option value="TODAS">Todas (Consolidado)</option>
              <option value="Sede">Congregação Sede</option>
              {congregacoes.map(c => (
                <option key={c.id} value={c.nome}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label>📅 Mês:</label>
            <select value={mesFiltro} onChange={e => setMesFiltro(e.target.value)} className="filtro-select">
              {mesesNomes.map(m => (
                <option key={m.valor} value={m.valor}>{m.nome}</option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label>📆 Ano:</label>
            <select value={anoFiltro} onChange={e => setAnoFiltro(e.target.value)} className="filtro-select">
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
        </div>

        <div className="modo-vis-btn-group">
          <button 
            className={`modo-vis-btn ${modoExibicao === 'LISTA' ? 'ativo' : ''}`}
            onClick={() => setModoExibicao('LISTA')}
          >
            📋 Visão em Lista
          </button>
          <button 
            className={`modo-vis-btn ${modoExibicao === 'CALENDARIO' ? 'ativo' : ''}`}
            onClick={() => setModoExibicao('CALENDARIO')}
          >
            📅 Calendário Visual
          </button>
        </div>
      </section>

      {/* MODO 1: CALENDÁRIO VISUAL MENSAL */}
      {modoExibicao === 'CALENDARIO' ? (
        <main className="calendario-grid">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(diaSem => (
            <div key={diaSem} className="calendario-dia-hdr">{diaSem}</div>
          ))}

          {diasCalendario.map((d, index) => (
            <div 
              key={index} 
              className={`calendario-dia-box ${d.outroMes ? 'outro-mes' : ''} ${d.hoje ? 'hoje' : ''}`}
            >
              {d.dia && <div className="dia-numero">{d.dia}</div>}
              {d.cultos && d.cultos.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => abrirModalEscalar(c)}
                  className={`culto-badge-cal ${c.tipoCulto.toLowerCase().includes('ceia') ? 'ceia' : c.tipoCulto.toLowerCase().includes('missões') ? 'missoes' : c.tipoCulto.toLowerCase().includes('ensino') ? 'ensino' : ''}`}
                  title={`Liturgia: ${c.tema || 'Sem tema'} - Preletor: ${c.preletor || 'A definir'}`}
                >
                  <strong>{c.horarioInicio}</strong> - {c.tipoCulto}
                </div>
              ))}
            </div>
          ))}
        </main>
      ) : (
        /* MODO 2: VISÃO EM LISTA DETALHADA */
        <main className="tabela-container">
          {cultosFiltrados.length === 0 ? (
            <p className="msg-vazia">Nenhum culto agendado para os filtros selecionados.</p>
          ) : (
            <table className="membros-tabela">
              <thead>
                <tr>
                  <th>Data e Horário</th>
                  <th>Tipo e Local</th>
                  <th>Preletor e Tema</th>
                  <th>Hinos da Harpa</th>
                  <th style={{ width: '60px', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {cultosFiltrados.map(culto => (
                  <tr key={culto.id}>
                    <td>
                      <strong>📅 {formatarData(culto.data)}</strong>
                      <div style={{ fontSize: '0.85rem', color: '#555' }}>⏰ {culto.horarioInicio} às {culto.horarioFim}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${culto.tipoCulto.toLowerCase().includes('ceia') ? 'inativo' : 'ativo'}`}>
                        {culto.tipoCulto}
                      </span>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>🏢 {culto.congregacao}</div>
                    </td>
                    <td>
                      <strong>🗣️ {culto.preletor || 'A definir'}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#555', fontStyle: 'italic' }}>📖 {culto.tema || 'Tema não informado'}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#444' }}>🎵 {culto.hinosHarpa || '-'}</td>
                    <td>
                      <button 
                        onClick={() => abrirModalEscalar(culto)}
                        style={{ backgroundColor: '#eef4fb', color: '#003366', border: '1px solid #93c5fd', padding: '6px 12px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        👥 Escalar ({culto.escalados ? culto.escalados.length : 0})
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <ActionMenu actions={[
                        { label: `Escalar Equipes (${culto.escalados ? culto.escalados.length : 0})`, icon: <FaUserFriends />, onClick: () => abrirModalEscalar(culto) },
                        { label: 'Editar Liturgia', icon: <FaEdit />, onClick: () => { setFormCulto(culto); setModalCultoAberto(true); } },
                        { label: 'Excluir Culto', icon: <FaTrashAlt />, danger: true, onClick: () => deletarCulto(culto.id) },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      )}

      {/* MODAL 1: AGENDAR OU EDITAR CULTO E LITURGIA */}
      {modalCultoAberto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>{formCulto.id ? 'Editar Liturgia do Culto' : 'Agendar Novo Culto / Evento'}</h2>
            <form onSubmit={salvarCulto} className="form-membro">
              <div className="form-linha">
                <div className="form-grupo">
                  <label>Data do Culto *</label>
                  <input 
                    type="date" 
                    value={formCulto.data} 
                    onChange={e => setFormCulto({ ...formCulto, data: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-grupo">
                  <label>Horário Início *</label>
                  <input 
                    type="time" 
                    value={formCulto.horarioInicio} 
                    onChange={e => setFormCulto({ ...formCulto, horarioInicio: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-grupo">
                  <label>Horário Fim</label>
                  <input 
                    type="time" 
                    value={formCulto.horarioFim} 
                    onChange={e => setFormCulto({ ...formCulto, horarioFim: e.target.value })} 
                  />
                </div>
              </div>

              <div className="form-linha">
                <div className="form-grupo">
                  <label>Tipo de Culto *</label>
                  <select 
                    value={formCulto.tipoCulto} 
                    onChange={e => setFormCulto({ ...formCulto, tipoCulto: e.target.value })}
                  >
                    {tiposCultoOpcoes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-grupo">
                  <label>Congregação / Local *</label>
                  <select 
                    value={formCulto.congregacao} 
                    onChange={e => setFormCulto({ ...formCulto, congregacao: e.target.value })}
                  >
                    <option value="Sede">Congregação Sede</option>
                    {congregacoes.map(c => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grupo">
                <label>Preletor (Pregador) *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Pr. João Santos ou Selecione da lista" 
                  value={formCulto.preletor} 
                  onChange={e => setFormCulto({ ...formCulto, preletor: e.target.value })}
                  required 
                />
              </div>

              <div className="form-grupo">
                <label>Tema da Mensagem</label>
                <input 
                  type="text" 
                  placeholder="Ex: A Grande Comissão e o Avivamento" 
                  value={formCulto.tema} 
                  onChange={e => setFormCulto({ ...formCulto, tema: e.target.value })} 
                />
              </div>

              <div className="form-grupo">
                <label>Hinos da Harpa Programados</label>
                <input 
                  type="text" 
                  placeholder="Ex: Harpa nº 15 e nº 115" 
                  value={formCulto.hinosHarpa} 
                  onChange={e => setFormCulto({ ...formCulto, hinosHarpa: e.target.value })} 
                />
              </div>

              <div className="modal-botoes">
                <button type="button" onClick={() => setModalCultoAberto(false)} className="btn-cancelar">Cancelar</button>
                <button type="submit" className="btn-novo">Salvar Culto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GESTÃO DE ESCALAS POR DEPARTAMENTO COM PREVENÇÃO DE CONFLITO SÊNIOR */}
      {modalEscalaAberto && cultoSelecionado && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ borderBottom: '2px solid #003366', paddingBottom: '10px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#003366' }}>Escala de Equipes — {cultoSelecionado.tipoCulto}</h2>
              <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                📅 {formatarData(cultoSelecionado.data)} às {cultoSelecionado.horarioInicio} | 🏢 {cultoSelecionado.congregacao}
              </p>
            </div>

            {/* ALERTA DE CONFLITO DE HORÁRIO/FUNÇÃO */}
            {mensagemConflito && (
              <div style={{ background: '#fdf2f2', border: '1px solid #f87171', color: '#991b1b', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {mensagemConflito}
              </div>
            )}

            {/* FORMULÁRIO DE ADICIONAR ESCALADO */}
            <form onSubmit={adicionarEscalado} style={{ background: '#f8fafc', padding: '18px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#003366' }}>Escalar Membro em um Departamento</h4>
              
              <div className="form-linha">
                <div className="form-grupo">
                  <label>Departamento / Equipe *</label>
                  <select 
                    value={formEscala.departamento} 
                    onChange={e => {
                      const dep = e.target.value;
                      const confDep = departamentosOpcoes.find(d => d.nome === dep);
                      setFormEscala({ 
                        ...formEscala, 
                        departamento: dep, 
                        funcao: confDep ? confDep.funcoes[0] : 'Função' 
                      });
                    }}
                  >
                    {departamentosOpcoes.map(d => (
                      <option key={d.nome} value={d.nome}>{d.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="form-grupo">
                  <label>Função Desempenhada *</label>
                  <select 
                    value={formEscala.funcao} 
                    onChange={e => setFormEscala({ ...formEscala, funcao: e.target.value })}
                  >
                    {(departamentosOpcoes.find(d => d.nome === formEscala.departamento)?.funcoes || ['Membro']).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-linha">
                <div className="form-grupo" style={{ flex: 2 }}>
                  <label>Membro Cadastrado da Igreja</label>
                  <select 
                    value={formEscala.membroId} 
                    onChange={e => setFormEscala({ ...formEscala, membroId: e.target.value, nomeVisitante: '' })}
                  >
                    <option value="">Selecione o Membro...</option>
                    {membros.map(m => (
                      <option key={m.id} value={m.id}>{m.nome} ({m.cargo}) - {m.congregacao}</option>
                    ))}
                  </select>
                </div>

                <div className="form-grupo">
                  <label>Ou Digite Nome Visitante/Convidado</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Irmão Pedro (Tecladista)" 
                    value={formEscala.nomeVisitante} 
                    onChange={e => setFormEscala({ ...formEscala, nomeVisitante: e.target.value, membroId: '' })} 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
              >
                ➕ Confirmar Escala
              </button>
            </form>

            {/* LISTAGEM DAS EQUIPES ESCALADAS POR DEPARTAMENTO */}
            <div>
              <h3 style={{ color: '#003366', marginBottom: '15px' }}>Equipes Escaladas para este Culto</h3>

              {departamentosOpcoes.map(dep => {
                const itensDoDep = (cultoSelecionado.escalados || []).filter(item => item.departamento === dep.nome);
                return (
                  <div key={dep.nome} className="dep-escala-card">
                    <h4>{dep.nome} ({itensDoDep.length})</h4>
                    {itensDoDep.length === 0 ? (
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#888', fontStyle: 'italic' }}>Nenhum escalado neste departamento.</p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {itensDoDep.map(item => (
                          <span key={item.id} className="escala-item-tag">
                            <strong>👤 {item.membro ? item.membro.nome : item.nomeMembro}</strong>
                            <span style={{ color: '#666', fontSize: '0.8rem' }}>({item.funcao})</span>
                            <button onClick={() => removerEscaladoDoCulto(item.id)} className="btn-remover-escala" title="Remover da escala">✕</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="modal-botoes" style={{ marginTop: '20px' }}>
              <button type="button" onClick={() => setModalEscalaAberto(false)} className="btn-cancelar">Concluir</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: RÉGUA DE MÉTRICAS PÓS-CULTO (PÚBLICO E ALMAS) */}
      {modalMetricasAberto && cultoSelecionado && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h2 style={{ color: '#003366', marginBottom: '15px' }}>Métricas Pós-Culto</h2>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
              Registre a contagem de público e decisões do culto de <strong>{formatarData(cultoSelecionado.data)}</strong>.
            </p>

            <form onSubmit={salvarMetricas} className="form-membro">
              <div className="form-linha">
                <div className="form-grupo">
                  <label>Membros Presentes</label>
                  <input 
                    type="number" 
                    value={formMetricas.qtdMembros} 
                    onChange={e => setFormMetricas({ ...formMetricas, qtdMembros: e.target.value })} 
                    min="0"
                  />
                </div>
                <div className="form-grupo">
                  <label>Visitantes</label>
                  <input 
                    type="number" 
                    value={formMetricas.qtdVisitantes} 
                    onChange={e => setFormMetricas({ ...formMetricas, qtdVisitantes: e.target.value })} 
                    min="0"
                  />
                </div>
                <div className="form-grupo">
                  <label>Crianças</label>
                  <input 
                    type="number" 
                    value={formMetricas.qtdCriancas} 
                    onChange={e => setFormMetricas({ ...formMetricas, qtdCriancas: e.target.value })} 
                    min="0"
                  />
                </div>
              </div>

              <div className="form-grupo" style={{ background: '#fff5f5', padding: '15px', borderRadius: '8px', border: '1px solid #feb2b2' }}>
                <label style={{ color: '#c53030', fontWeight: 'bold' }}>✝️ Almas para Cristo (Decisões / Conversões):</label>
                <input 
                  type="number" 
                  value={formMetricas.decisoesAlmas} 
                  onChange={e => setFormMetricas({ ...formMetricas, decisoesAlmas: e.target.value })} 
                  min="0"
                  style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e63946' }}
                />
              </div>

              <div className="modal-botoes">
                <button type="button" onClick={() => setModalMetricasAberto(false)} className="btn-cancelar">Cancelar</button>
                <button type="submit" className="btn-novo" style={{ backgroundColor: '#2a9d8f' }}>Salvar Métricas</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EXPORTAÇÃO DA ESCALA DO MÊS EM PDF / IMPRESSÃO */}
      {modalExportarEscalaAberto && (
        <div className="modal-overlay">
          <div className="modal-content modal-escala-print-content" style={{ maxWidth: '900px', maxHeight: '95vh', overflowY: 'auto' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
              <h3 style={{ margin: 0, color: '#003366' }}>Pré-visualização da Escala Mensal</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => window.print()} 
                  style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🖨️ Imprimir / Salvar PDF
                </button>
                <button 
                  onClick={() => setModalExportarEscalaAberto(false)} 
                  style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* ÁREA IMPRESSA DA ESCALA DO MÊS */}
            <div className="relatorio-folha-impressao" style={{ padding: '20px' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #003366', paddingBottom: '15px', marginBottom: '20px' }}>
                <h1 style={{ margin: '0 0 5px 0', color: '#003366', fontSize: '1.6rem', textTransform: 'uppercase' }}>Igreja Evangélica Assembleia de Deus</h1>
                <h3 style={{ margin: '0 0 5px 0', color: '#555', fontSize: '1.1rem' }}>
                  ESCALA DE CULTOS E SERVIÇOS — MÊS DE {mesesNomes.find(m => m.valor === mesFiltro)?.nome.toUpperCase()} / {anoFiltro}
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#777' }}>Congregação: {congregacaoFiltro || 'Todas (Consolidado)'}</p>
              </div>

              {cultosFiltrados.map(culto => (
                <div key={culto.id} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '20px', padding: '15px', background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '10px' }}>
                    <strong style={{ color: '#003366', fontSize: '1rem' }}>
                      📅 {formatarData(culto.data)} ({culto.horarioInicio}) — {culto.tipoCulto}
                    </strong>
                    <span style={{ fontSize: '0.85rem', color: '#555' }}>🏢 {culto.congregacao}</span>
                  </div>

                  <div style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                    <span><strong>Preletor:</strong> {culto.preletor || 'A definir'}</span> | <span><strong>Tema:</strong> {culto.tema || '-'}</span> | <span><strong>Hinos:</strong> {culto.hinosHarpa || '-'}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', fontSize: '0.8rem' }}>
                    {departamentosOpcoes.map(dep => {
                      const escaladosDep = (culto.escalados || []).filter(i => i.departamento === dep.nome);
                      if (escaladosDep.length === 0) return null;
                      return (
                        <div key={dep.nome} style={{ background: '#f8fafc', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          <strong style={{ color: '#003366', display: 'block', marginBottom: '4px' }}>{dep.nome}:</strong>
                          {escaladosDep.map(item => (
                            <div key={item.id}>• {item.membro ? item.membro.nome : item.nomeMembro} ({item.funcao})</div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '40px', paddingTop: '15px', textAlign: 'center' }}>
                <div style={{ width: '40%' }}>
                  <div style={{ borderTop: '1px solid #333', paddingTop: '5px', fontSize: '0.85rem' }}>
                    <strong>Pastor Presidente / Dirigente</strong>
                  </div>
                </div>
                <div style={{ width: '40%' }}>
                  <div style={{ borderTop: '1px solid #333', paddingTop: '5px', fontSize: '0.85rem' }}>
                    <strong>Líder de Escalas / Eventos</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 5: IMPRESSÃO / SALVAR PDF DO CALENDÁRIO VISUAL MENSAL */}
      {modalImprimirCalendarioAberto && (
        <div className="modal-overlay">
          <div className="modal-content modal-calendario-print-content" style={{ maxWidth: '950px', maxHeight: '95vh', overflowY: 'auto' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
              <h3 style={{ margin: 0, color: '#003366' }}>Pré-visualização do Calendário Mensal em PDF</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => window.print()} 
                  style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🖨️ Imprimir / Salvar PDF
                </button>
                <button 
                  onClick={() => setModalImprimirCalendarioAberto(false)} 
                  style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* CORPO IMPRESSO DO CALENDÁRIO VISUAL MENSAL */}
            <div className="relatorio-folha-impressao" style={{ padding: '15px' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #003366', paddingBottom: '12px', marginBottom: '15px' }}>
                <h1 style={{ margin: '0 0 4px 0', color: '#003366', fontSize: '1.5rem', textTransform: 'uppercase' }}>Igreja Evangélica Assembleia de Deus</h1>
                <h3 style={{ margin: '0 0 4px 0', color: '#555', fontSize: '1.1rem' }}>
                  CALENDÁRIO MENSAL DE CULTOS E EVENTOS — {mesesNomes.find(m => m.valor === mesFiltro)?.nome.toUpperCase()} / {anoFiltro}
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#777' }}>Congregação: {congregacaoFiltro || 'Todas (Consolidado)'}</p>
              </div>

              {/* GRADE DE DIAS DO CALENDÁRIO */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '20px' }}>
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(diaSem => (
                  <div key={diaSem} style={{ textAlign: 'center', fontWeight: 'bold', background: '#003366', color: 'white', padding: '6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    {diaSem}
                  </div>
                ))}

                {diasCalendario.map((d, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      minHeight: '85px', 
                      background: d.outroMes ? '#f1f5f9' : '#ffffff', 
                      border: '1px solid #cbd5e1', 
                      borderRadius: '6px', 
                      padding: '4px', 
                      opacity: d.outroMes ? 0.4 : 1,
                      fontSize: '0.75rem' 
                    }}
                  >
                    {d.dia && <div style={{ fontWeight: 'bold', color: '#003366', marginBottom: '2px' }}>{d.dia}</div>}
                    {d.cultos && d.cultos.map(c => (
                      <div 
                        key={c.id} 
                        style={{ 
                          background: c.tipoCulto.toLowerCase().includes('ceia') ? '#6b21a8' : c.tipoCulto.toLowerCase().includes('missões') ? '#c2410c' : '#003366', 
                          color: 'white', 
                          padding: '3px 4px', 
                          borderRadius: '4px', 
                          marginBottom: '3px',
                          lineHeight: '1.2' 
                        }}
                      >
                        <strong>{c.horarioInicio}</strong> {c.tipoCulto}
                        {c.preletor && <div style={{ fontSize: '0.68rem', opacity: 0.9 }}>🗣️ {c.preletor}</div>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '30px', paddingTop: '15px', textAlign: 'center' }}>
                <div style={{ width: '40%' }}>
                  <div style={{ borderTop: '1px solid #333', paddingTop: '5px', fontSize: '0.8rem' }}>
                    <strong>Pastor Presidente / Dirigente</strong>
                  </div>
                </div>
                <div style={{ width: '40%' }}>
                  <div style={{ borderTop: '1px solid #333', paddingTop: '5px', fontSize: '0.8rem' }}>
                    <strong>Secretaria / Eventos ADCESE</strong>
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

export default Cultos;
