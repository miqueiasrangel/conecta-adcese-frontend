import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import NavbarHeader from '../../components/NavbarHeader/NavbarHeader';
import ActionMenu from '../../components/ActionMenu/ActionMenu';
import { FaCheckCircle } from 'react-icons/fa';
import '../Secretaria/Secretaria.css';
import './Gabinete.css';

function Gabinete() {
  // ESTADO DA ABA ATIVA
  const [abaAtiva, setAbaAtiva] = useState('VISAO_AGUIA'); // 'VISAO_AGUIA', 'AGENDA_ACONSELHAMENTO', 'VISITACAO', 'DISCIPLINA'

  // ESTADOS DE DADOS
  const [membros, setMembros] = useState([]);
  const [compromissos, setCompromissos] = useState([]);
  const [aconselhamentos, setAconselhamentos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [visitas, setVisitas] = useState([]);

  // MODAIS
  const [modalCompromissoAberto, setModalCompromissoAberto] = useState(false);
  const [modalAconselhamentoAberto, setModalAconselhamentoAberto] = useState(false);
  const [modalDisciplinaAberto, setModalDisciplinaAberto] = useState(false);
  const [modalVisitaAberto, setModalVisitaAberto] = useState(false);
  const [modalRelatorioVisitaAberto, setModalRelatorioVisitaAberto] = useState(false);

  // SELEÇÕES
  const [itemSelecionado, setItemSelecionado] = useState(null);

  // FORMULÁRIOS
  const [formCompromisso, setFormCompromisso] = useState({
    titulo: '',
    tipoCompromisso: 'Atendimento de Gabinete',
    dataHorario: new Date().toISOString().slice(0, 16),
    local: 'Gabinete Pastoral - Sede',
    membroId: '',
    nomeMembro: '',
    observacoes: ''
  });

  const [formAconselhamento, setFormAconselhamento] = useState({
    membroId: '',
    nomeMembro: '',
    dataAtendimento: new Date().toISOString().split('T')[0],
    categoria: 'Conjugal',
    anotacoesConfidenciais: '',
    proximaReavaliacao: ''
  });

  const [formDisciplina, setFormDisciplina] = useState({
    membroId: '',
    nomeMembro: '',
    dataInicio: new Date().toISOString().split('T')[0],
    dataReavaliacao: '',
    motivoOrientacao: '',
    observacoesAcompanhamento: ''
  });

  const [formVisita, setFormVisita] = useState({
    nomeSolicitante: '',
    nomePessoaVisita: '',
    categoria: 'Enfermos / Hospitalar',
    enderecoTelefone: '',
    delegadoPara: 'Pastor Presidente'
  });

  const [formRelatorioVisita, setFormRelatorioVisita] = useState({
    relatorioVisita: '',
    dataVisitaRealizada: new Date().toISOString().split('T')[0]
  });

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
    api.get('/membros')
      .then(res => setMembros(Array.isArray(res.data) ? res.data : (res.data?.content || [])))
      .catch(err => console.error("Erro ao carregar membros:", err));

    api.get('/gabinete/compromissos')
      .then(res => setCompromissos(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Erro ao carregar compromissos:", err));

    api.get('/gabinete/aconselhamentos')
      .then(res => setAconselhamentos(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Erro ao carregar aconselhamentos:", err));

    api.get('/gabinete/disciplinas')
      .then(res => setDisciplinas(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Erro ao carregar disciplinas:", err));

    api.get('/gabinete/visitas')
      .then(res => setVisitas(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Erro ao carregar visitas:", err));
  };

  // 🦅 DADOS DA VISÃO DE ÁGUIA (TERMÔMETRO & EVASÃO)
  const totalMembrosAtivos = membros.filter(m => m.status === 'Ativo').length;
  const membrosEmAtençãoEvasao = membros.filter(m => m.status === 'Afastado' || m.status === 'Inativo');

  // SALVAR COMPROMISSO NA AGENDA
  const salvarCompromisso = (e) => {
    e.preventDefault();
    let nome = formCompromisso.nomeMembro;
    if (formCompromisso.membroId) {
      const memb = membros.find(m => String(m.id) === String(formCompromisso.membroId));
      if (memb) nome = memb.nome;
    }

    const payload = {
      ...formCompromisso,
      nomeMembro: nome,
      membroId: formCompromisso.membroId ? parseInt(formCompromisso.membroId) : null
    };

    api.post('/gabinete/compromissos', payload)
      .then(() => {
        alert("Compromisso agendado na Agenda Pastoral!");
        setModalCompromissoAberto(false);
        carregarDados();
      })
      .catch(err => alert("Erro ao agendar compromisso."));
  };

  // SALVAR ACONSELHAMENTO CONFIDENCIAL
  const salvarAconselhamento = (e) => {
    e.preventDefault();
    let nome = formAconselhamento.nomeMembro;
    if (formAconselhamento.membroId) {
      const memb = membros.find(m => String(m.id) === String(formAconselhamento.membroId));
      if (memb) nome = memb.nome;
    }

    const payload = {
      ...formAconselhamento,
      nomeMembro: nome,
      membroId: formAconselhamento.membroId ? parseInt(formAconselhamento.membroId) : null
    };

    api.post('/gabinete/aconselhamentos', payload)
      .then(() => {
        alert("Ficha confidencial de aconselhamento salva com sucesso!");
        setModalAconselhamentoAberto(false);
        carregarDados();
      })
      .catch(err => alert("Erro ao salvar aconselhamento."));
  };

  // SALVAR GESTÃO DE DISCIPLINA / RESTAURAÇÃO
  const salvarDisciplina = (e) => {
    e.preventDefault();
    let nome = formDisciplina.nomeMembro;
    if (formDisciplina.membroId) {
      const memb = membros.find(m => String(m.id) === String(formDisciplina.membroId));
      if (memb) nome = memb.nome;
    }

    const payload = {
      ...formDisciplina,
      nomeMembro: nome,
      membroId: formDisciplina.membroId ? parseInt(formDisciplina.membroId) : null,
      status: 'Em Restauração'
    };

    api.post('/gabinete/disciplinas', payload)
      .then(() => {
        alert("Acompanhamento de disciplina/restauração registrado!");
        setModalDisciplinaAberto(false);
        carregarDados();
      })
      .catch(err => alert("Erro ao salvar disciplina."));
  };

  const reintegrarMembro = (disciplina) => {
    if (window.confirm(`Confirmar a reintegração espiritual do irmão(ã) "${disciplina.nomeMembro}" à comunhão da igreja?`)) {
      api.put(`/gabinete/disciplinas/${disciplina.id}`, { ...disciplina, status: 'Reintegrado' })
        .then(() => {
          alert(`Membro "${disciplina.nomeMembro}" reintegrado à comunhão com sucesso! Glória a Deus!`);
          carregarDados();
        })
        .catch(err => console.error("Erro ao reintegrar", err));
    }
  };

  // SALVAR PEDIDO DE VISITA
  const salvarVisita = (e) => {
    e.preventDefault();
    api.post('/gabinete/visitas', formVisita)
      .then(() => {
        alert("Pedido de visita registrado e encaminhado na fila!");
        setModalVisitaAberto(false);
        carregarDados();
      })
      .catch(err => alert("Erro ao cadastrar visita."));
  };

  const concluirVisitaComRelatorio = (e) => {
    e.preventDefault();
    if (!itemSelecionado) return;

    const payload = {
      ...itemSelecionado,
      status: 'Concluída',
      relatorioVisita: formRelatorioVisita.relatorioVisita,
      dataVisitaRealizada: formRelatorioVisita.dataVisitaRealizada
    };

    api.put(`/gabinete/visitas/${itemSelecionado.id}`, payload)
      .then(() => {
        alert("Relatório de visita cadastrado com sucesso!");
        setModalRelatorioVisitaAberto(false);
        carregarDados();
      })
      .catch(err => alert("Erro ao salvar relatório de visita."));
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    const partes = dataStr.split('T')[0].split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : dataStr;
  };

  return (
    <div className="gabinete-wrapper">
      <NavbarHeader 
        tituloModulo="Gabinete Pastoral"
        descricaoModulo="Cuidado Espiritual, Agenda Pastoral, Aconselhamento Confidencial, Visitação e Visão de Águia"
      />

      <div className="gabinete-container">

      {/* SELETOR DE ABAS DO GABINETE */}
      <nav className="gabinete-tabs">
        <button 
          className={`tab-btn ${abaAtiva === 'VISAO_AGUIA' ? 'ativa' : ''}`}
          onClick={() => setAbaAtiva('VISAO_AGUIA')}
        >
          🦅 Visão de Águia (Dashboard)
        </button>
        <button 
          className={`tab-btn ${abaAtiva === 'AGENDA_ACONSELHAMENTO' ? 'ativa' : ''}`}
          onClick={() => setAbaAtiva('AGENDA_ACONSELHAMENTO')}
        >
          📅 Agenda & Aconselhamento
        </button>
        <button 
          className={`tab-btn ${abaAtiva === 'VISITACAO' ? 'ativa' : ''}`}
          onClick={() => setAbaAtiva('VISITACAO')}
        >
          🕊️ Visitação e Capelania ({visitas.filter(v => v.status === 'Pendente').length})
        </button>
        <button 
          className={`tab-btn ${abaAtiva === 'DISCIPLINA' ? 'ativa' : ''}`}
          onClick={() => setAbaAtiva('DISCIPLINA')}
        >
          🛡️ Disciplina e Restauração ({disciplinas.filter(d => d.status === 'Em Restauração').length})
        </button>
      </nav>

      {/* ABA 1: 🦅 VISÃO DE ÁGUIA (TERMÔMETRO & ALERTA DE EVASÃO) */}
      {abaAtiva === 'VISAO_AGUIA' && (
        <div>
          <section className="visao-aguia-grid">
            <div className="aguia-card">
              <span>Membros Ativos na Igreja</span>
              <h2>{totalMembrosAtivos} membros</h2>
            </div>
            <div className="aguia-card entradas">
              <span>Entradas / Batismos no Período</span>
              <h2>+ {membros.filter(m => m.status === 'Ativo').length} cadastrados</h2>
            </div>
            <div className="aguia-card saidas">
              <span>Saídas / Transferências / Óbitos</span>
              <h2>- {membros.filter(m => m.status === 'Inativo').length} registros</h2>
            </div>
            <div className="aguia-card alerta">
              <span>Membros em Alerta de Evasão</span>
              <h2>{membrosEmAtençãoEvasao.length} em atenção</h2>
            </div>
          </section>

          {/* ALERTA DE EVASÃO (PREVENÇÃO DE AFASTAMENTO) */}
          <section className="alerta-evasao-box">
            <div className="alerta-evasao-hdr">
              <span style={{ fontSize: '1.5rem' }}>🚨</span>
              <div>
                <h3>Alerta de Evasão Pastoral — Lista de Atenção Preventiva</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f1d1d' }}>
                  Membros com status "Afastado" ou inativos que necessitam de visita ou acompanhamento espiritual urgente.
                </p>
              </div>
            </div>

            {membrosEmAtençãoEvasao.length === 0 ? (
              <p style={{ margin: 0, color: '#15803d', fontWeight: 'bold' }}>🟢 Glória a Deus! Nenhum membro em alerta de evasão neste momento.</p>
            ) : (
              <table className="membros-tabela">
                <thead>
                  <tr>
                    <th>Membro</th>
                    <th>Congregação</th>
                    <th>Telefone / Contato</th>
                    <th>Status Atual</th>
                    <th>Ação Preventiva</th>
                  </tr>
                </thead>
                <tbody>
                  {membrosEmAtençãoEvasao.map(m => (
                    <tr key={m.id}>
                      <td><strong>👤 {m.nome}</strong></td>
                      <td>🏢 {m.congregacao}</td>
                      <td>📞 {m.telefone || 'Sem telefone'}</td>
                      <td><span className="status-badge inativo">{m.status}</span></td>
                      <td>
                        <button 
                          onClick={() => {
                            setFormVisita({
                              nomeSolicitante: 'Pastor Presidente (Alerta Evasão)',
                              nomePessoaVisita: m.nome,
                              categoria: 'Afastados / Desviados',
                              enderecoTelefone: `Tel: ${m.telefone || '-'} | Cong: ${m.congregacao}`,
                              delegadoPara: 'Pastor Presidente'
                            });
                            setModalVisitaAberto(true);
                          }}
                          style={{ backgroundColor: '#e63946', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          🕊️ Solicitar Visita Pastoral
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      )}

      {/* ABA 2: 📅 AGENDA PASTORAL & ACONSELHAMENTO CONFIDENCIAL */}
      {abaAtiva === 'AGENDA_ACONSELHAMENTO' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#003366', margin: 0 }}>Agenda Pastoral e Aconselhamento Individual</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setModalCompromissoAberto(true)} className="btn-novo">
                📅 Marcar Compromisso / Atendimento
              </button>
              <button onClick={() => setModalAconselhamentoAberto(true)} style={{ backgroundColor: '#6b21a8', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                🔒 Registrar Aconselhamento Confidencial
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            {/* LISTA DE COMPROMISSOS */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              <h4 style={{ color: '#003366', borderBottom: '2px solid #003366', paddingBottom: '8px', marginTop: 0 }}>
                📅 Compromissos Agendados ({compromissos.length})
              </h4>
              {compromissos.length === 0 ? (
                <p style={{ color: '#888', fontStyle: 'italic' }}>Nenhum compromisso agendado.</p>
              ) : (
                compromissos.map(c => (
                  <div key={c.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                    <strong>{c.tipoCompromisso}</strong>: {c.titulo}
                    <div style={{ fontSize: '0.85rem', color: '#555' }}>📅 {formatarData(c.dataHorario)} | 📍 {c.local}</div>
                    {c.nomeMembro && <div style={{ fontSize: '0.85rem', color: '#003366' }}>👤 Membro: {c.nomeMembro}</div>}
                  </div>
                ))
              )}
            </div>

            {/* FICHA CONFIDENCIAL DE ACONSELHAMENTO (RESTRIÇÃO PASTORAL) */}
            <div style={{ background: '#fcf6ff', padding: '20px', borderRadius: '10px', border: '1px solid #e9d5ff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              <h4 style={{ color: '#6b21a8', borderBottom: '2px solid #6b21a8', paddingBottom: '8px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                🔒 Prontuário Espiritual (Restrito Pastoral)
              </h4>
              {aconselhamentos.length === 0 ? (
                <p style={{ color: '#888', fontStyle: 'italic' }}>Nenhum registro de aconselhamento confidencial.</p>
              ) : (
                aconselhamentos.map(a => (
                  <div key={a.id} style={{ background: 'white', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #f3e8ff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ color: '#6b21a8' }}>👤 {a.nomeMembro}</strong>
                      <span style={{ fontSize: '0.8rem', background: '#f3e8ff', padding: '2px 8px', borderRadius: '10px', color: '#6b21a8', fontWeight: 'bold' }}>{a.categoria}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>📅 Data: {formatarData(a.dataAtendimento)}</div>
                    <p style={{ fontSize: '0.85rem', color: '#333', fontStyle: 'italic', margin: '8px 0 0 0', background: '#faf5ff', padding: '8px', borderRadius: '4px' }}>
                      "{a.anotacoesConfidenciais}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: 🕊️ VISITAÇÃO E CAPELANIA (A IGREJA FORA DAS QUATRO PAREDES) */}
      {abaAtiva === 'VISITACAO' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#003366', margin: 0 }}>Fila de Pedidos de Visita e Capelania</h3>
            <button onClick={() => setModalVisitaAberto(true)} className="btn-novo">
              ➕ Cadastrar Pedido de Visita
            </button>
          </div>

          <main className="visitas-grid">
            {visitas.length === 0 ? (
              <p style={{ gridColumn: '1/-1', color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '30px', background: 'white', borderRadius: '10px' }}>
                Nenhum pedido de visita registrado na fila.
              </p>
            ) : (
              visitas.map(v => (
                <div key={v.id} className="visita-card">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span className={`badge-visita-cat ${v.categoria.toLowerCase().includes('enfermo') ? 'hospitalar' : v.categoria.toLowerCase().includes('afastado') ? 'desviados' : v.categoria.toLowerCase().includes('luto') ? 'luto' : ''}`}>
                        {v.categoria}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: v.status === 'Concluída' ? '#15803d' : '#c2410c' }}>
                        {v.status}
                      </span>
                    </div>

                    <h4 style={{ margin: '5px 0', color: '#003366' }}>👤 {v.nomePessoaVisita}</h4>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#666' }}>
                      📍 <strong>Endereço / Contato:</strong> {v.enderecoTelefone || 'Não informado'}
                    </p>
                    <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                      <strong>Solicitante:</strong> {v.nomeSolicitante || 'Secretaria'}<br/>
                      <strong>Delegado para:</strong> <span style={{ color: '#003366', fontWeight: 'bold' }}>{v.delegadoPara}</span>
                    </div>

                    {v.relatorioVisita && (
                      <div style={{ marginTop: '12px', background: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', borderLeft: '3px solid #28a745' }}>
                        <strong>📝 Resumo da Visita:</strong> "{v.relatorioVisita}"
                      </div>
                    )}
                  </div>

                  {v.status !== 'Concluída' && (
                    <button 
                      onClick={() => { setItemSelecionado(v); setModalRelatorioVisitaAberto(true); }}
                      style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px', width: '100%' }}
                    >
                      📝 Preencher Relatório de Visita Realizada
                    </button>
                  )}
                </div>
              ))
            )}
          </main>
        </div>
      )}

      {/* ABA 4: 🛡️ GESTÃO DE DISCIPLINA E RESTAURAÇÃO ESPIRITUAL */}
      {abaAtiva === 'DISCIPLINA' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#003366', margin: 0 }}>Acompanhamento de Disciplina e Restauração Espiritual</h3>
            <button onClick={() => setModalDisciplinaAberto(true)} className="btn-novo" style={{ backgroundColor: '#dc3545' }}>
              🛡️ Registrar Disciplina / Acompanhamento
            </button>
          </div>

          <main className="tabela-container">
            {disciplinas.length === 0 ? (
              <p className="msg-vazia">Nenhum membro em processo de disciplina ou restauração registrado.</p>
            ) : (
              <table className="membros-tabela">
                <thead>
                  <tr>
                    <th>Membro</th>
                    <th>Data Início</th>
                    <th>Data Reavaliação</th>
                    <th>Orientações Pastorais</th>
                    <th>Status</th>
                    <th style={{ width: '60px', textAlign: 'center' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {disciplinas.map(d => (
                    <tr key={d.id}>
                      <td><strong>👤 {d.nomeMembro}</strong></td>
                      <td>📅 {formatarData(d.dataInicio)}</td>
                      <td>📅 {formatarData(d.dataReavaliacao)}</td>
                      <td style={{ fontSize: '0.85rem', color: '#555' }}>{d.motivoOrientacao || '-'}</td>
                      <td>
                        <span className={`status-badge ${d.status === 'Reintegrado' ? 'ativo' : 'inativo'}`}>
                          {d.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {d.status !== 'Reintegrado' ? (
                          <ActionMenu actions={[
                            { label: 'Reintegrar à Comunhão', icon: <FaCheckCircle />, onClick: () => reintegrarMembro(d) },
                          ]} />
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </main>
        </div>
      )}

      {/* MODAL 1: MARCAR COMPROMISSO NA AGENDA PASTORAL */}
      {modalCompromissoAberto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h2>Agendar Compromisso Pastoral</h2>
            <form onSubmit={salvarCompromisso} className="form-membro">
              <div className="form-grupo">
                <label>Título do Compromisso *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Reunião com a Diretoria ou Casamento de Fulano" 
                  value={formCompromisso.titulo} 
                  onChange={e => setFormCompromisso({ ...formCompromisso, titulo: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-linha">
                <div className="form-grupo">
                  <label>Tipo de Compromisso *</label>
                  <select 
                    value={formCompromisso.tipoCompromisso} 
                    onChange={e => setFormCompromisso({ ...formCompromisso, tipoCompromisso: e.target.value })}
                  >
                    <option value="Atendimento de Gabinete">Atendimento de Gabinete</option>
                    <option value="Casamento">Casamento</option>
                    <option value="Reunião de Diretoria">Reunião de Diretoria</option>
                    <option value="Visita Pastoral">Visita Pastoral</option>
                    <option value="Viagem / Evento Externo">Viagem / Evento Externo</option>
                  </select>
                </div>

                <div className="form-grupo">
                  <label>Data e Hora *</label>
                  <input 
                    type="datetime-local" 
                    value={formCompromisso.dataHorario} 
                    onChange={e => setFormCompromisso({ ...formCompromisso, dataHorario: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="form-linha">
                <div className="form-grupo">
                  <label>Local</label>
                  <input 
                    type="text" 
                    value={formCompromisso.local} 
                    onChange={e => setFormCompromisso({ ...formCompromisso, local: e.target.value })} 
                  />
                </div>

                <div className="form-grupo">
                  <label>Membro Relacionado (Opcional)</label>
                  <select 
                    value={formCompromisso.membroId} 
                    onChange={e => setFormCompromisso({ ...formCompromisso, membroId: e.target.value })}
                  >
                    <option value="">Selecione se for atendimento...</option>
                    {membros.map(m => (
                      <option key={m.id} value={m.id}>{m.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-botoes">
                <button type="button" onClick={() => setModalCompromissoAberto(false)} className="btn-cancelar">Cancelar</button>
                <button type="submit" className="btn-novo">Salvar Compromisso</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ACONSELHAMENTO PASTORAL CONFIDENCIAL */}
      {modalAconselhamentoAberto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h2 style={{ color: '#6b21a8' }}>🔒 Registrar Ficha de Aconselhamento Confidencial</h2>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>Esta ficha é estritamente confidencial e visível apenas ao Gabinete Pastoral.</p>

            <form onSubmit={salvarAconselhamento} className="form-membro">
              <div className="form-linha">
                <div className="form-grupo" style={{ flex: 2 }}>
                  <label>Membro Atendido *</label>
                  <select 
                    value={formAconselhamento.membroId} 
                    onChange={e => setFormAconselhamento({ ...formAconselhamento, membroId: e.target.value })}
                    required
                  >
                    <option value="">Selecione o Membro...</option>
                    {membros.map(m => (
                      <option key={m.id} value={m.id}>{m.nome} - {m.congregacao}</option>
                    ))}
                  </select>
                </div>

                <div className="form-grupo">
                  <label>Categoria *</label>
                  <select 
                    value={formAconselhamento.categoria} 
                    onChange={e => setFormAconselhamento({ ...formAconselhamento, categoria: e.target.value })}
                  >
                    <option value="Conjugal">Crise Conjugal</option>
                    <option value="Financeiro">Lutas Financeiras</option>
                    <option value="Espiritual">Orientação Espiritual</option>
                    <option value="Familiar">Conflito Familiar</option>
                    <option value="Geral">Aconselhamento Geral</option>
                  </select>
                </div>
              </div>

              <div className="form-grupo">
                <label>Anotações Confidenciais do Atendimento *</label>
                <textarea 
                  rows="4" 
                  placeholder="Descreva o contexto do atendimento para lembrar na próxima consulta..." 
                  value={formAconselhamento.anotacoesConfidenciais} 
                  onChange={e => setFormAconselhamento({ ...formAconselhamento, anotacoesConfidenciais: e.target.value })} 
                  required
                />
              </div>

              <div className="modal-botoes">
                <button type="button" onClick={() => setModalAconselhamentoAberto(false)} className="btn-cancelar">Cancelar</button>
                <button type="submit" className="btn-novo" style={{ backgroundColor: '#6b21a8' }}>Salvar Ficha Confidencial</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTRAR DISCIPLINA E RESTAURAÇÃO */}
      {modalDisciplinaAberto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h2 style={{ color: '#dc3545' }}>🛡️ Acompanhamento de Disciplina / Restauração</h2>

            <form onSubmit={salvarDisciplina} className="form-membro">
              <div className="form-linha">
                <div className="form-grupo" style={{ flex: 2 }}>
                  <label>Membro em Disciplina *</label>
                  <select 
                    value={formDisciplina.membroId} 
                    onChange={e => setFormDisciplina({ ...formDisciplina, membroId: e.target.value })}
                    required
                  >
                    <option value="">Selecione o Membro...</option>
                    {membros.map(m => (
                      <option key={m.id} value={m.id}>{m.nome} ({m.cargo})</option>
                    ))}
                  </select>
                </div>

                <div className="form-grupo">
                  <label>Data Reavaliação</label>
                  <input 
                    type="date" 
                    value={formDisciplina.dataReavaliacao} 
                    onChange={e => setFormDisciplina({ ...formDisciplina, dataReavaliacao: e.target.value })} 
                  />
                </div>
              </div>

              <div className="form-grupo">
                <label>Orientações Pastorais e Motivo *</label>
                <textarea 
                  rows="3" 
                  placeholder="Orientações dadas ao membro para o período de restauração..." 
                  value={formDisciplina.motivoOrientacao} 
                  onChange={e => setFormDisciplina({ ...formDisciplina, motivoOrientacao: e.target.value })} 
                  required
                />
              </div>

              <div className="modal-botoes">
                <button type="button" onClick={() => setModalDisciplinaAberto(false)} className="btn-cancelar">Cancelar</button>
                <button type="submit" className="btn-novo" style={{ backgroundColor: '#dc3545' }}>Salvar Acompanhamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CADASTRAR PEDIDO DE VISITA */}
      {modalVisitaAberto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h2>Cadastrar Pedido de Visita</h2>

            <form onSubmit={salvarVisita} className="form-membro">
              <div className="form-linha">
                <div className="form-grupo">
                  <label>Nome do Solicitante</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Secretaria ou Irmã Maria" 
                    value={formVisita.nomeSolicitante} 
                    onChange={e => setFormVisita({ ...formVisita, nomeSolicitante: e.target.value })} 
                  />
                </div>

                <div className="form-grupo">
                  <label>Pessoa a ser Visitada *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Irmão Pedro Silva" 
                    value={formVisita.nomePessoaVisita} 
                    onChange={e => setFormVisita({ ...formVisita, nomePessoaVisita: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="form-linha">
                <div className="form-grupo">
                  <label>Categoria da Visita *</label>
                  <select 
                    value={formVisita.categoria} 
                    onChange={e => setFormVisita({ ...formVisita, categoria: e.target.value })}
                  >
                    <option value="Enfermos / Hospitalar">🏥 Enfermos / Hospitalar</option>
                    <option value="Afastados / Desviados">🏃 Afastados / Desviados</option>
                    <option value="Luto / Consolo">🕊️ Luto / Consolo</option>
                    <option value="Recém-Convertidos">🌱 Recém-Convertidos</option>
                    <option value="Visita Familiar">🏡 Visita Familiar</option>
                  </select>
                </div>

                <div className="form-grupo">
                  <label>Encaminhar / Delegar para *</label>
                  <select 
                    value={formVisita.delegadoPara} 
                    onChange={e => setFormVisita({ ...formVisita, delegadoPara: e.target.value })}
                  >
                    <option value="Pastor Presidente">Pastor Presidente</option>
                    <option value="Dirigente de Congregação">Dirigente de Congregação</option>
                    <option value="Equipe de Diáconos">Equipe de Diáconos</option>
                    <option value="Círculo de Oração">Círculo de Oração</option>
                  </select>
                </div>
              </div>

              <div className="form-grupo">
                <label>Endereço / Telefone para Contato</label>
                <input 
                  type="text" 
                  placeholder="Ex: Rua A, nº 123 - Bairro Central | Tel: (79) 99999-8888" 
                  value={formVisita.enderecoTelefone} 
                  onChange={e => setFormVisita({ ...formVisita, enderecoTelefone: e.target.value })} 
                />
              </div>

              <div className="modal-botoes">
                <button type="button" onClick={() => setModalVisitaAberto(false)} className="btn-cancelar">Cancelar</button>
                <button type="submit" className="btn-novo">Encaminhar Pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: RELATÓRIO DE VISITA REALIZADA */}
      {modalRelatorioVisitaAberto && itemSelecionado && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <h2>Relatório de Visita Realizada</h2>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>Pessoa Visitada: <strong>{itemSelecionado.nomePessoaVisita}</strong></p>

            <form onSubmit={concluirVisitaComRelatorio} className="form-membro">
              <div className="form-grupo">
                <label>Resumo da Visita *</label>
                <textarea 
                  rows="4" 
                  placeholder="Ex: Visitei o irmão no hospital, oramos, ele se recupera bem da cirurgia..." 
                  value={formRelatorioVisita.relatorioVisita} 
                  onChange={e => setFormRelatorioVisita({ ...formRelatorioVisita, relatorioVisita: e.target.value })} 
                  required 
                />
              </div>

              <div className="modal-botoes">
                <button type="button" onClick={() => setModalRelatorioVisitaAberto(false)} className="btn-cancelar">Cancelar</button>
                <button type="submit" className="btn-novo" style={{ backgroundColor: '#28a745' }}>Concluir e Salvar Relatório</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
    </div>
  );
}

export default Gabinete;
