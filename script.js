// ====================== DADOS ======================
let bens = JSON.parse(localStorage.getItem("bens")) || [];
let chamados = JSON.parse(localStorage.getItem("chamados")) || [];
let filtroChamadoAtual = 'todos';
let atividades = JSON.parse(localStorage.getItem("atividades")) || [];
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [
    { id: 1, nome: "Administrador", email: "admin@isepam.edu.br", senha: "123", role: "admin" },
    { id: 2, nome: "Técnico", email: "tecnico@isepam.edu.br", senha: "123", role: "tecnico" }
];

// Converte usuários antigos com role "usuario" para "tecnico"
usuarios = usuarios.map(u => {
    if (u.role === "usuario") return { ...u, role: "tecnico" };
    return u;
});
localStorage.setItem("usuarios", JSON.stringify(usuarios));

let usuarioLogado = "";
let usuarioRole = "";
let navHistorico = [];
let navPosicao = -1;
let navIgnorarProxima = false;

// ====================== PERMISSÕES ======================
function verificarPermissao(acao) {
    if (usuarioRole === 'admin') return true;
    if (usuarioRole === 'tecnico') {
        const acoesPermitidas = [
            'abrirChamado', 'aceitarChamado',
            'concluirChamado', 'excluirChamado', 'verInventario'
        ];
        return acoesPermitidas.includes(acao);
    }
    return false;
}

// ====================== SEGURANÇA ======================
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ====================== SALVAR ======================
function salvar() {
    localStorage.setItem("bens", JSON.stringify(bens));
    localStorage.setItem("chamados", JSON.stringify(chamados));
    localStorage.setItem("atividades", JSON.stringify(atividades));
}

function salvarUsuarios() {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

// ====================== INICIALIZAÇÃO ======================
window.onload = () => {
    document.getElementById("dataCad").value = new Date().toISOString().split('T')[0];
    
    document.getElementById("cardAndamento").onclick = () => {
        mostrarTela('chamados', 'Em andamento');
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") fecharModal();
    });

    configurarNavegacaoEnter();

    const fotoInput = document.getElementById("fotoChamado");
    if (fotoInput) {
        fotoInput.addEventListener("change", previewFotoChamado);
    }
};

function configurarNavegacaoEnter() {
    document.addEventListener('keydown', (e) => {
        if (e.key !== "Enter") return;

        const ativo = e.target;
        const tag = ativo.tagName.toLowerCase();

        if (tag === 'textarea' || tag === 'button' || tag === 'a' || (tag === 'input' && ativo.type === 'submit')) {
            return;
        }

        e.preventDefault();

        if (!document.getElementById("loginTela").classList.contains("escondido")) {
            const campos = ["email", "senha"];
            const idx = campos.indexOf(ativo.id);
            if (idx !== -1 && idx < campos.length - 1) {
                document.getElementById(campos[idx+1]).focus();
            } else if (idx === campos.length - 1) {
                login();
            }
            return;
        }

        if (!document.getElementById("cadastro").classList.contains("escondido")) {
            const campos = ["numero", "nome", "valor", "notaFiscal", "fornecedor", "localizacao", "estado", "categoria"];
            const idx = campos.indexOf(ativo.id);
            if (idx !== -1 && idx < campos.length - 1) {
                document.getElementById(campos[idx+1]).focus();
            } else if (idx === campos.length - 1) {
                cadastrarBem();
            }
            return;
        }

        if (!document.getElementById("bens").classList.contains("escondido")) {
            const campos = ["buscaNumero", "buscaNome"];
            const idx = campos.indexOf(ativo.id);
            if (idx !== -1 && idx < campos.length - 1) {
                document.getElementById(campos[idx+1]).focus();
            } else if (idx === campos.length - 1) {
                filtrarTudo();
            }
            return;
        }

        if (!document.getElementById("chamados").classList.contains("escondido")) {
            const campos = ["patrimonioChamado", "descricaoChamado"];
            const idx = campos.indexOf(ativo.id);
            if (idx !== -1 && idx < campos.length - 1) {
                document.getElementById(campos[idx+1]).focus();
            } else if (idx === campos.length - 1) {
                abrirChamado();
            }
            return;
        }
    });
}

// ====================== LOGIN ======================
function mostrarTelaCadastro() {
    document.getElementById("formLogin").classList.add("escondido");
    document.getElementById("formCadastro").classList.remove("escondido");
    document.getElementById("loginSubtitle").innerText = "Criar conta";
    setTimeout(() => document.getElementById("nomeCadastro").focus(), 100);
}

function voltarParaLogin() {
    document.getElementById("formCadastro").classList.add("escondido");
    document.getElementById("formLogin").classList.remove("escondido");
    document.getElementById("loginSubtitle").innerText = "Acesse o sistema";
    document.getElementById("nomeCadastro").value = "";
    document.getElementById("emailCadastro").value = "";
    document.getElementById("senhaCadastro").value = "";
}

function cadastrarUsuario() {
    const nome = document.getElementById("nomeCadastro").value.trim();
    const email = document.getElementById("emailCadastro").value.trim().toLowerCase();
    const senha = document.getElementById("senhaCadastro").value.trim();
    const role = document.getElementById("roleCadastro").value;

    if (!nome || !email || !senha) {
        showToast("Preencha todos os campos obrigatórios!", "error");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast("Digite um email válido! Ex: nome@dominio.com", "error");
        return;
    }

    if (senha.length < 6) {
        showToast("A senha deve ter pelo menos 6 caracteres!", "error");
        return;
    }

    if (usuarios.some(u => u.email === email)) {
        showToast("Este email já está cadastrado!", "error");
        return;
    }

    usuarios.push({ id: Date.now(), nome, email, senha, role });
    salvarUsuarios();

    showToast("Cadastro realizado com sucesso!", "success");

    // Limpa os campos
    document.getElementById("nomeCadastro").value = "";
    document.getElementById("senhaCadastro").value = "";
    document.getElementById("roleCadastro").value = "tecnico";

    // Volta para o login com o email já preenchido
    voltarParaLogin();
    document.getElementById("email").value = email;
    setTimeout(() => document.getElementById("senha").focus(), 100);
}

function login() {
    const email = document.getElementById("email").value.trim().toLowerCase();
    const senha = document.getElementById("senha").value;

    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    
    if (usuario) {
        usuarioLogado = usuario.nome;
        usuarioRole = usuario.role;

        document.getElementById("loginTela").classList.add("escondido");

        let loading = document.getElementById("loadingOverlay");
        if (!loading) {
            loading = document.createElement("div");
            loading.id = "loadingOverlay";
            loading.className = "loading-overlay";
            loading.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-text">Carregando sistema...</div>
                <div style="margin-top:10px; font-size:13px; opacity:0.7;">Bem-vindo, ${escapeHTML(usuario.nome.split(' ')[0])}!</div>
            `;
            document.body.appendChild(loading);
        }
        loading.style.display = "flex";

        setTimeout(() => {
            document.getElementById("sistema").classList.remove("escondido");
            setTimeout(() => {
                document.getElementById("sistema").classList.add("show");
            }, 50);
            document.getElementById("usuarioInfo").innerHTML = `Olá, ${escapeHTML(usuario.nome)} (${usuarioRole === 'admin' ? 'Admin' : 'Técnico'})`;
            loading.style.display = "none";
            mostrarTela('dashboard');
            ativarBotaoMenu('dashboard');   // <--- LINHA ADICIONADA
        }, 1800);

    } else {
        showToast("Email ou senha incorretos!", "error");
    }
}

function logout() {
    if (confirm("Deseja realmente sair?")) location.reload();
}

// ====================== NAVEGAÇÃO ======================
function mostrarTela(id, filtroChamado = null) {
    // Registra no histórico de navegação (exceto ao usar as setas)
    if (!navIgnorarProxima) {
        const entrada = { id, filtroChamado };
        if (navPosicao < navHistorico.length - 1) {
            navHistorico = navHistorico.slice(0, navPosicao + 1);
        }
        const atual = navHistorico[navPosicao];
        if (!atual || atual.id !== id || atual.filtroChamado !== filtroChamado) {
            navHistorico.push(entrada);
            navPosicao = navHistorico.length - 1;
        }
        atualizarBotoesNav();
    }
    navIgnorarProxima = false;

    // Esconde todas as telas
    document.querySelectorAll(".tela").forEach(t => t.classList.add("escondido"));
    const tela = document.getElementById(id);
    if (tela) tela.classList.remove("escondido");

    // Marca o botão do menu como ativo
    ativarBotaoMenu(id);

    // Atualizações específicas por tela
    if (id === 'dashboard') {
        atualizarDashboard();
        renderAtividades();
    }
    if (id === 'bens') filtrarTudo();
    if (id === 'cadastro') {
        setTimeout(() => document.getElementById("numero").focus(), 100);
    }
    if (id === 'chamados') {
        const filtro = filtroChamado !== null ? filtroChamado : 'todos';
        filtrarChamados(filtro);
    }
    if (id === 'relatorio') {
        setTimeout(() => {
            const abaEstatisticas = document.getElementById("abaEstatisticas");
            if (abaEstatisticas && !abaEstatisticas.classList.contains("escondido")) {
                atualizarEstatisticas();
            }
        }, 100);
    }
}

// Função para ativar o botão correspondente no menu
function ativarBotaoMenu(telaId) {
    // Mapeamento dos IDs das telas para os textos dos botões (ou use data-atributo)
    const mapa = {
        'dashboard': 'Dashboard',
        'bens': 'Inventário',
        'cadastro': 'Cadastrar',
        'chamados': 'Chamados',
        'relatorio': 'Relatórios'
    };

    const nomeBotao = mapa[telaId];
    if (!nomeBotao) return;

    // Remove a classe 'ativo' de todos os botões do menu
    document.querySelectorAll('.menu nav button').forEach(btn => {
        btn.classList.remove('ativo');
    });

    // Adiciona a classe 'ativo' ao botão cujo texto corresponde (ignorando maiúsculas/minúsculas)
    const botoes = document.querySelectorAll('.menu nav button');
    for (let btn of botoes) {
        if (btn.textContent.trim() === nomeBotao) {
            btn.classList.add('ativo');
            break;
        }
    }
}

function navVoltar() {
    if (navPosicao <= 0) return;
    navPosicao--;
    const entrada = navHistorico[navPosicao];
    navIgnorarProxima = true;
    mostrarTela(entrada.id, entrada.filtroChamado);
    atualizarBotoesNav();
}

function navAvancar() {
    if (navPosicao >= navHistorico.length - 1) return;
    navPosicao++;
    const entrada = navHistorico[navPosicao];
    navIgnorarProxima = true;
    mostrarTela(entrada.id, entrada.filtroChamado);
    atualizarBotoesNav();
}

function atualizarBotoesNav() {
    const btnVoltar = document.getElementById("btnNavVoltar");
    const btnAvancar = document.getElementById("btnNavAvancar");
    if (!btnVoltar || !btnAvancar) return;

    btnVoltar.disabled = navPosicao <= 0;
    btnAvancar.disabled = navPosicao >= navHistorico.length - 1;
}

// ====================== ATIVIDADES ======================
function registrarAtividade(msg) {
    const agora = new Date().toLocaleString('pt-BR');
    atividades.unshift({ data: agora, texto: msg });
    if (atividades.length > 20) atividades.pop();
    salvar();
}

function renderAtividades() {
    const container = document.getElementById("listaAtividades");
    if (!container) return;
    container.innerHTML = atividades.length ? 
        atividades.map(a => `<div class="log-item"><small>${escapeHTML(a.data)}</small><p>${escapeHTML(a.texto)}</p></div>`).join('') 
        : '<p style="color:#64748b; text-align:center;">Nenhuma atividade recente.</p>';
}

// ====================== CADASTRO DE BENS ======================
function cadastrarBem() {
    if (!verificarPermissao('cadastrarBem')) {
        showToast("Você não tem permissão para cadastrar bens.", "error");
        return;
    }

    const numero = document.getElementById("numero").value.trim();
    const nome = document.getElementById("nome").value.trim();
    const valor = parseFloat(document.getElementById("valor").value) || 0;

    if (!numero || !nome || valor <= 0) {
        showToast("Número, Nome e Valor (R$ maior que zero) são obrigatórios!", "error");
        return;
    }

    if (bens.some(b => b.numero === numero)) {
        showToast("Já existe um bem com este número de patrimônio!", "error");
        return;
    }

    const novo = {
        numero: numero,
        nome: nome,
        valor: valor,
        notaFiscal: document.getElementById("notaFiscal").value.trim(),
        fornecedor: document.getElementById("fornecedor").value.trim(),
        localizacao: document.getElementById("localizacao").value.trim() || "Não informada",
        estado: document.getElementById("estado").value,
        categoria: document.getElementById("categoria").value,
        data: document.getElementById("dataCad").value
    };

    bens.push(novo);
    registrarAtividade(`Cadastrado: ${nome} (Nº ${numero}) - R$ ${valor.toFixed(2)}`);
    
    showToast("Bem cadastrado com sucesso!", "success");    
    
    document.getElementById("numero").value = "";
    document.getElementById("nome").value = "";
    document.getElementById("valor").value = "";
    document.getElementById("notaFiscal").value = "";
    document.getElementById("fornecedor").value = "";
    document.getElementById("localizacao").value = "";
    document.getElementById("numero").focus();

    salvar();
    atualizarDashboard();
}

// ====================== INVENTÁRIO ======================
function filtrarTudo() {
    const num = document.getElementById("buscaNumero").value.toLowerCase().trim();
    const nomeFiltro = document.getElementById("buscaNome").value.toLowerCase().trim();

    const filtrados = bens.filter(b => 
        b.numero.toLowerCase().includes(num) && 
        b.nome.toLowerCase().includes(nomeFiltro)
    );

    let html = filtrados.map(b => `
        <tr>
            <td data-label="Nº">${escapeHTML(b.numero)}</td>
            <td data-label="Nome">${escapeHTML(b.nome)}</td>
            <td data-label="Valor">R$ ${parseFloat(b.valor).toFixed(2)}</td>
            <td data-label="Local">${escapeHTML(b.localizacao)}</td>
            <td data-label="Estado">${escapeHTML(b.estado)}</td>
            <td data-label="Ações">
                <button onclick="verFicha('${escapeHTML(b.numero)}')" class="btn-ver-ficha">Ver Ficha</button>
            </td>
        </tr>
    `).join('');

    if (filtrados.length === 0) {
        html = `<tr><td colspan="6" style="text-align:center;padding:50px;color:#64748b;">Nenhum bem encontrado.</td></tr>`;
    }

    document.getElementById("corpoTabela").innerHTML = html;
}

function verFicha(num) {
    const item = bens.find(b => b.numero === num);
    if (!item) return;

    // Controle de visibilidade dos botões conforme permissão
    const podeEditar = verificarPermissao('editarBem');
    const podeExcluir = usuarioRole === 'admin'; // só admin exclui

    document.getElementById("conteudoModal").innerHTML = `
        <h3>Ficha Técnica - ${escapeHTML(item.nome)}</h3>
        <p><strong>Nº Patrimônio:</strong> ${escapeHTML(item.numero)}</p>
        <p><strong>Valor:</strong> R$ ${parseFloat(item.valor).toFixed(2)}</p>
        <p><strong>Localização:</strong> ${escapeHTML(item.localizacao)}</p>
        <p><strong>Categoria:</strong> ${escapeHTML(item.categoria)}</p>
        <p><strong>Data de Entrada:</strong> ${escapeHTML(item.data)}</p>

        <label>Estado de Conservação:</label>
        <select id="estadoAtual" style="width:100%; padding:10px; margin:8px 0; border-radius:8px;" ${!podeEditar ? 'disabled' : ''}>
            <option value="Novo" ${item.estado === "Novo" ? "selected" : ""}>Novo</option>
            <option value="Bom" ${item.estado === "Bom" ? "selected" : ""}>Bom</option>
            <option value="Regular" ${item.estado === "Regular" ? "selected" : ""}>Regular</option>
            <option value="Ruim" ${item.estado === "Ruim" ? "selected" : ""}>Ruim</option>
        </select>

        <label>Nova Localização:</label>
        <input id="novaLoc" value="${escapeHTML(item.localizacao)}" style="width:100%; margin:8px 0; padding:10px;" ${!podeEditar ? 'disabled' : ''}>

        <div style="margin-top: 20px; display: flex; gap: 10px; flex-direction: column;">
            ${podeEditar ? `<button onclick="salvarAlteracoesFicha('${escapeHTML(item.numero)}')" style="background:#2563eb; color:white; padding:12px;">Salvar Alterações</button>` : ''}
            ${podeExcluir ? `<button onclick="excluirBem('${escapeHTML(item.numero)}')" style="background:#ef4444; color:white; padding:12px;">Excluir Bem</button>` : ''}
        </div>
    `;

    document.getElementById("modalGeral").classList.remove("escondido");
}

function salvarAlteracoesFicha(num) {
    if (!verificarPermissao('editarBem')) {
        showToast("Você não tem permissão para editar bens.", "error");
        return;
    }

    const item = bens.find(b => b.numero === num);
    if (!item) return;

    const novoEstado = document.getElementById("estadoAtual").value;
    const novaLocalizacao = document.getElementById("novaLoc").value.trim();

    let alterado = false;

    if (novoEstado !== item.estado) {
        item.estado = novoEstado;
        registrarAtividade(`Estado alterado: ${item.nome} → ${novoEstado}`);
        alterado = true;
    }

    if (novaLocalizacao && novaLocalizacao !== item.localizacao) {
        item.localizacao = novaLocalizacao;
        registrarAtividade(`Localização alterada: ${item.nome} → ${novaLocalizacao}`);
        alterado = true;
    }

    if (alterado) {
        salvar();
        showToast("Alterações salvas com sucesso!", "success");
        fecharModal();
        filtrarTudo();
        atualizarDashboard();
    } else {
        showToast("Nenhuma alteração foi feita.", "info");
    }
}

function excluirBem(num) {
    if (usuarioRole !== 'admin') {
        showToast("Apenas administradores podem excluir bens.", "error");
        return;
    }

    const chamadosRelacionados = chamados.filter(c => c.patrimonio === num);
    if (chamadosRelacionados.length > 0) {
        const ok = confirm(`Este bem possui ${chamadosRelacionados.length} chamado(s). Excluir mesmo assim? Os chamados serão removidos.`);
        if (!ok) return;
        chamados = chamados.filter(c => c.patrimonio !== num);
        registrarAtividade(`Chamados do bem ${num} removidos por exclusão do patrimônio.`);
        salvar();
    }

    if (!confirm("Tem certeza que deseja excluir este bem permanentemente?")) return;

    bens = bens.filter(b => b.numero !== num);
    registrarAtividade(`Bem excluído: Nº ${num}`);
    salvar();
    fecharModal();
    filtrarTudo();
    atualizarDashboard();
    showToast("Bem excluído com sucesso!", "success");
}

// ====================== CHAMADOS ======================
function abrirChamado() {
    const patrimonioNum = document.getElementById("patrimonioChamado").value.trim();
    const descricao = document.getElementById("descricaoChamado").value.trim();
    const fotoFile = document.getElementById("fotoChamado").files[0];

    if (!patrimonioNum || !descricao) {
        showToast("Número do patrimônio e descrição são obrigatórios!", "error");
        return;
    }

    const bemExistente = bens.find(b => b.numero === patrimonioNum);
    if (!bemExistente) {
        showToast("Número de patrimônio não cadastrado no inventário!", "error");
        return;
    }

    const chamadoAberto = chamados.find(c => c.patrimonio === patrimonioNum && c.status === "Aberto");
    if (chamadoAberto) {
        showToast(`Já existe um chamado em aberto para o patrimônio ${patrimonioNum}.`, "error");
        return;
    }

    const salvarChamado = (foto64) => {
        chamados.push({ 
            id: Date.now(), 
            patrimonio: patrimonioNum, 
            descricao: descricao, 
            foto: foto64, 
            status: "Aberto", 
            tecnico: null, 
            feedback: "", 
            data: new Date().toLocaleString('pt-BR') 
        });
        registrarAtividade(`Chamado aberto para ${patrimonioNum} - ${bemExistente.nome}`);
        salvar();
        
        filtrarChamados('Aberto');
        
        showToast("Chamado aberto com sucesso!", "success");
        
        document.getElementById("patrimonioChamado").value = "";
        document.getElementById("descricaoChamado").value = "";
        document.getElementById("fotoChamado").value = "";
        
        const previewDiv = document.getElementById("previewFoto");
        if (previewDiv) previewDiv.style.display = "none";
        const imgPreview = document.getElementById("imgPreview");
        if (imgPreview) imgPreview.src = "#";
    };

    if (fotoFile) {
        const reader = new FileReader();
        reader.onload = e => salvarChamado(e.target.result);
        reader.readAsDataURL(fotoFile);
    } else {
        salvarChamado(null);
    }
}

function excluirChamado(id) {
    if (!verificarPermissao('excluirChamado')) {
        showToast("Você não tem permissão para excluir chamados.", "error");
        return;
    }

    const chamado = chamados.find(c => c.id === id);
    if (!chamado) return;

    if (chamado.status !== "Aberto") {
        showToast("Apenas chamados em aberto podem ser excluídos.", "error");
        return;
    }

    if (!confirm(`Tem certeza que deseja excluir o chamado do patrimônio ${chamado.patrimonio}?`)) return;

    chamados = chamados.filter(c => c.id !== id);
    registrarAtividade(`Chamado excluído: Patrimônio ${chamado.patrimonio}`);
    salvar();
    filtrarChamados(filtroChamadoAtual);
    atualizarDashboard();
    showToast("Chamado excluído com sucesso!", "success");
}

function previewFotoChamado() {
    const input = document.getElementById("fotoChamado");
    const previewDiv = document.getElementById("previewFoto");
    const imgPreview = document.getElementById("imgPreview");

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imgPreview.src = e.target.result;
            previewDiv.style.display = "block";
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        previewDiv.style.display = "none";
        imgPreview.src = "#";
    }
}

function renderizarChamados(filtro = null) {
    const container = document.getElementById("listaChamados");

    const ini = document.getElementById("filtroChamadoDataInicio")?.value || "";
    const fim = document.getElementById("filtroChamadoDataFim")?.value || "";
    const cat = document.getElementById("filtroChamadoCategoria")?.value || "";

    let lista = chamados.filter(c => {
        // Filtro de status
        if (filtro && filtro !== 'todos' && c.status !== filtro) return false;

        // Filtro de data
        if (ini || fim) {
            const dataChamado = c.data.split(' ')[0];
            const [dia, mes, ano] = dataChamado.split('/');
            const dataISO = `${ano}-${mes}-${dia}`;
            if (ini && dataISO < ini) return false;
            if (fim && dataISO > fim) return false;
        }

        // Filtro de categoria (busca pelo bem relacionado)
        if (cat) {
            const bem = bens.find(b => b.numero === c.patrimonio);
            if (!bem || bem.categoria !== cat) return false;
        }

        return true;
    });

    if (lista.length === 0) {
        container.innerHTML = `<p style="color:#64748b; text-align:center; padding:30px;">Nenhum chamado encontrado.</p>`;
        return;
    }

    const podeAceitarFinalizar = verificarPermissao('aceitarChamado');

    container.innerHTML = lista.map(c => `
        <div class="card-chamado">
            <span class="badge" style="background:${c.status === 'Concluído' ? '#10b981' : 
                                           c.status === 'Em andamento' ? '#f59e0b' : 
                                           c.status === 'Não reparado' ? '#ef4444' : '#3b82f6'}">
                ${escapeHTML(c.status)}
            </span>
            
            <h4>Patrimônio: ${escapeHTML(c.patrimonio)}</h4>
            <p class="descricao">${escapeHTML(c.descricao)}</p>
            
            ${c.foto ? `<img src="${escapeHTML(c.foto)}" class="foto-chamado" onclick="ampliarFoto('${escapeHTML(c.foto)}')">` : ''}
            
            ${c.feedback ? `<div class="feedback"><strong>Resolução:</strong> ${escapeHTML(c.feedback)}</div>` : ''}

            <div class="acoes-card">
                ${c.status === 'Aberto' && podeAceitarFinalizar ? `
                    <button onclick="aceitarChamado(${c.id})" class="btn-aceitar">Aceitar</button>
                    <button onclick="excluirChamado(${c.id})" style="background:#ef4444; color:white;">🗑 Excluir</button>
                ` : ''}
                ${c.status === 'Em andamento' && podeAceitarFinalizar ? `
                    <button onclick="abrirModalFeedback(${c.id})" class="btn-finalizar">Finalizar</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function aceitarChamado(id) {
    if (!verificarPermissao('aceitarChamado')) {
        showToast("Você não tem permissão para aceitar chamados.", "error");
        return;
    }

    const c = chamados.find(ch => ch.id === id);
    if (c && c.status === "Aberto") {
        c.status = "Em andamento";
        c.tecnico = usuarioLogado;
        salvar();
        registrarAtividade(`Chamado do patrimônio ${c.patrimonio} aceito por ${usuarioLogado}`);
        filtrarChamados(filtroChamadoAtual);
        showToast("Chamado aceito e movido para 'Em andamento'.", "success");
    }
}

function abrirModalFeedback(id) {
    if (!verificarPermissao('concluirChamado')) {
        showToast("Você não tem permissão para finalizar chamados.", "error");
        return;
    }

    const chamado = chamados.find(c => c.id === id);
    if (!chamado) return;

    const bem = bens.find(b => b.numero === chamado.patrimonio);

    document.getElementById("conteudoModal").innerHTML = `
        <h3>Finalizar Chamado - ${escapeHTML(chamado.patrimonio)}</h3>
        <p><strong>Problema:</strong> ${escapeHTML(chamado.descricao)}</p>
        
        <textarea id="feedbackTexto" placeholder="Descreva o que foi feito ou o motivo da falha..." rows="4" style="width:100%; margin-bottom: 20px;"></textarea>

        <label><strong>Novo Estado do Bem:</strong></label>
        <select id="novoEstadoBem" style="width:100%; padding:12px; margin-bottom: 15px; border-radius:8px;">
            <option value="Novo" ${bem && bem.estado === "Novo" ? "selected" : ""}>Novo</option>
            <option value="Bom" ${bem && bem.estado === "Bom" ? "selected" : ""}>Bom</option>
            <option value="Regular" ${bem && bem.estado === "Regular" ? "selected" : ""}>Regular</option>
            <option value="Ruim" ${bem && bem.estado === "Ruim" ? "selected" : ""}>Ruim</option>
        </select>

        <label style="margin-top: 20px; display: block;"><strong>Resultado do Chamado:</strong></label>

        <div style="display: flex; gap: 12px; margin-bottom: 25px;">
            <button onclick="concluirChamado(${id}, 'Concluído')" 
                    style="flex: 1; background: #10b981; color: white; padding: 16px 12px; font-size: 15.5px; font-weight: 600; border: none; border-radius: 10px; cursor: pointer;">
                 Concluído com Sucesso
            </button>
            
            <button onclick="concluirChamado(${id}, 'Não reparado')" 
                    style="flex: 1; background: #ef4444; color: white; padding: 16px 12px; font-size: 15.5px; font-weight: 600; border: none; border-radius: 10px; cursor: pointer;">
                Não foi possível reparar
            </button>
        </div>

        <div style="display: flex; gap: 10px; flex-direction: column;">
            <button onclick="fecharModal()" style="background: #64748b; color: white; padding: 14px; border-radius: 8px; border: none;">
                Cancelar
            </button>
        </div>
    `;

    document.getElementById("modalGeral").classList.remove("escondido");
}

function concluirChamado(id, novoStatus) {
    if (!verificarPermissao('concluirChamado')) {
        showToast("Você não tem permissão para finalizar chamados.", "error");
        return;
    }

    const feedback = document.getElementById("feedbackTexto").value.trim();
    if (!feedback) return showToast("O feedback é obrigatório!", "error");

    const chamado = chamados.find(ch => ch.id === id);
    if (!chamado) return;

    const novoEstado = document.getElementById("novoEstadoBem") ? 
                       document.getElementById("novoEstadoBem").value : null;

    chamado.status = novoStatus;
    chamado.feedback = feedback;
    chamado.dataConclusao = new Date().toLocaleString('pt-BR');

    if (novoEstado) {
        const bem = bens.find(b => b.numero === chamado.patrimonio);
        if (bem && novoEstado !== bem.estado) {
            bem.estado = novoEstado;
            registrarAtividade(`Chamado ${novoStatus.toLowerCase()}: ${bem.nome} → Estado alterado para ${novoEstado}`);
        }
    }

    registrarAtividade(`Chamado ${novoStatus === 'Concluído' ? 'concluído' : 'encerrado sem reparo'} para ${chamado.patrimonio}`);

    salvar();
    fecharModal();
    filtrarChamados(filtroChamadoAtual);
    atualizarDashboard();
    showToast(`Chamado ${novoStatus === 'Concluído' ? 'concluído' : 'encerrado'} com sucesso.`, "success");
}

function filtrarChamados(status) {
    filtroChamadoAtual = status;
    renderizarChamados(status === 'todos' ? null : status);
    
    document.querySelectorAll('.filtro-chamado').forEach(btn => {
        btn.classList.remove('ativo');
        if (btn.innerText === status || (status === 'todos' && btn.innerText === 'Todos')) {
            btn.classList.add('ativo');
        }
    });
}

function ampliarFoto(url) {
    const modal = document.getElementById("modalGeral");
    const conteudo = document.getElementById("conteudoModal");
    
    conteudo.innerHTML = `
        <div style="text-align: center; background: transparent;">
            <img src="${escapeHTML(url)}" style="max-width: 80vw; max-height: 80vh; width: auto; height: auto; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <br><br>
            <button onclick="fecharModal()" style="background: #2563eb; color: white; border: none; padding: 10px 24px; border-radius: 30px; font-weight: bold; cursor: pointer;">Fechar</button>
        </div>
    `;
    
    const modalContent = document.querySelector('#modalGeral .modal-content');
    if (modalContent) {
        modalContent.style.background = 'rgba(0,0,0,0.85)';
        modalContent.style.padding = '20px';
        modalContent.style.maxWidth = '90vw';
        modalContent.style.width = 'auto';
        modalContent.style.boxShadow = 'none';
        modalContent.style.borderRadius = '16px';
    }
    
    modal.classList.remove("escondido");
}

function fecharModal() {
    const modal = document.getElementById("modalGeral");
    modal.classList.add("escondido");
    
    const modalContent = document.querySelector('#modalGeral .modal-content');
    if (modalContent) {
        modalContent.style.background = '';
        modalContent.style.padding = '';
        modalContent.style.maxWidth = '';
        modalContent.style.width = '';
        modalContent.style.boxShadow = '';
        modalContent.style.borderRadius = '';
    }
}

// ====================== RELATÓRIOS ======================
function gerarRelatorioItens() {
    const ini = document.getElementById("dataInicio").value;
    const fim = document.getElementById("dataFim").value;
    const cat = document.getElementById("filtroCategoriaPDF").value;
    const est = document.getElementById("filtroEstadoPDF").value;

    let filtrados = bens.filter(b => {
        const dataOk = (!ini || b.data >= ini) && (!fim || b.data <= fim);
        const catOk = !cat || b.categoria === cat;
        const estOk = !est || b.estado === est;
        return dataOk && catOk && estOk;
    });

    document.getElementById("cabecalhoRelatorio").innerHTML = `
        <table>
            <th>Data Entrada</th>
            <th>Nº Patrimônio</th>
            <th>Nome do Item</th>
            <th>Categoria</th>
            <th>Valor (R$)</th>
            <th>Localização</th>
            <th>Estado</th>
        </tr>`;

    let html = filtrados.map(b => `
        <tr>
            <td>${escapeHTML(b.data)}</td>
            <td>${escapeHTML(b.numero)}</td>
            <td>${escapeHTML(b.nome)}</td>
            <td>${escapeHTML(b.categoria)}</td>
            <td>R$ ${parseFloat(b.valor).toFixed(2)}</td>
            <td>${escapeHTML(b.localizacao)}</td>
            <td>${escapeHTML(b.estado)}</td>
        </tr>
    `).join('');

    document.getElementById("corpoRelatorio").innerHTML = html || 
        `<tr><td colspan="7" style="text-align:center; padding:50px; color:#64748b;">Nenhum bem encontrado.</td></tr>`;
}

function gerarPDFItens() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    adicionarCabecalhoPDF(doc, "Relatório de Patrimônio");

    const ini = document.getElementById("dataInicio").value;
    const fim = document.getElementById("dataFim").value;
    const cat = document.getElementById("filtroCategoriaPDF").value;
    const est = document.getElementById("filtroEstadoPDF").value;

    let filtrados = bens.filter(b => {
        const dataOk = (!ini || b.data >= ini) && (!fim || b.data <= fim);
        const catOk = !cat || b.categoria === cat;
        const estOk = !est || b.estado === est;
        return dataOk && catOk && estOk;
    });

    const valorTotal = filtrados.reduce((acc, b) => acc + parseFloat(b.valor || 0), 0);

    doc.setFontSize(12);
    doc.text(`Total de Bens (filtrados): ${filtrados.length}   |   Valor Total: R$ ${valorTotal.toFixed(2)}`, 20, 55);

    const tabela = filtrados.map(b => [
        b.data,
        b.numero,
        b.nome.length > 38 ? b.nome.substring(0, 35) + "..." : b.nome,
        b.categoria,
        "R$ " + parseFloat(b.valor).toFixed(2),
        b.localizacao,
        b.estado
    ]);

    doc.autoTable({
        startY: 65,
        head: [['Data', 'Nº Patrimônio', 'Nome', 'Categoria', 'Valor', 'Localização', 'Estado']],
        body: tabela,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 15, right: 15 }
    });

    adicionarRodapePDF(doc);
    doc.save("relatorio_patrimonio_isepam.pdf");
}

async function gerarExcelItens() {
    const ini = document.getElementById("dataInicio").value;
    const fim = document.getElementById("dataFim").value;
    const cat = document.getElementById("filtroCategoriaPDF").value;
    const est = document.getElementById("filtroEstadoPDF").value;

    let filtrados = bens.filter(b => {
        const dataOk = (!ini || b.data >= ini) && (!fim || b.data <= fim);
        const catOk = !cat || b.categoria === cat;
        const estOk = !est || b.estado === est;
        return dataOk && catOk && estOk;
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = "ISEPAM";
    const ws = wb.addWorksheet("Patrimônio");

    // Largura das colunas
    ws.columns = [
        { key: "data",       width: 14 },
        { key: "numero",     width: 16 },
        { key: "nome",       width: 32 },
        { key: "categoria",  width: 16 },
        { key: "valor",      width: 14 },
        { key: "localizacao",width: 22 },
        { key: "estado",     width: 12 },
        { key: "notaFiscal", width: 16 },
        { key: "fornecedor", width: 20 },
    ];

    // Linha de título
    ws.mergeCells("A1:I1");
    const titulo = ws.getCell("A1");
    titulo.value = "ISEPAM — Relatório de Patrimônio";
    titulo.font = { name: "Arial", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
    titulo.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
    titulo.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(1).height = 32;

    // Linha de subtítulo (data de geração + totais)
    ws.mergeCells("A2:I2");
    const sub = ws.getCell("A2");
    const valorTotal = filtrados.reduce((acc, b) => acc + parseFloat(b.valor || 0), 0);
    sub.value = `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})}   |   Total de itens: ${filtrados.length}   |   Valor total: R$ ${valorTotal.toLocaleString('pt-BR', {minimumFractionDigits:2})}`;
    sub.font = { name: "Arial", size: 9, color: { argb: "FFFFFFFF" } };
    sub.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1D4ED8" } };
    sub.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(2).height = 20;

    // Linha de cabeçalho
    const cabecalho = ws.addRow(["Data Entrada", "Nº Patrimônio", "Nome", "Categoria", "Valor (R$)", "Localização", "Estado", "Nota Fiscal", "Fornecedor"]);
    cabecalho.eachCell(cell => {
        cell.font = { name: "Arial", bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E2937" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
            bottom: { style: "thin", color: { argb: "FF2563EB" } }
        };
    });
    ws.getRow(3).height = 22;

    // Linhas de dados
    filtrados.forEach((b, i) => {
        const row = ws.addRow([
            b.data,
            b.numero,
            b.nome,
            b.categoria,
            parseFloat(b.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            b.localizacao,
            b.estado,
            b.notaFiscal || "",
            b.fornecedor || ""
        ]);

        const bg = i % 2 === 0 ? "FFF8FAFC" : "FFFFFFFF";
        row.eachCell(cell => {
            cell.font = { name: "Arial", size: 9 };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
            cell.alignment = { vertical: "middle" };
            cell.border = {
                bottom: { style: "hair", color: { argb: "FFE2E8F0" } }
            };
        });
        row.height = 18;
    });

    // Rodapé
    ws.addRow([]);
    const rodape = ws.addRow([`ISEPAM — Sistema de Gestão de Patrimônio • Página gerada automaticamente`]);
    ws.mergeCells(`A${ws.rowCount}:I${ws.rowCount}`);
    const celRodape = ws.getCell(`A${ws.rowCount}`);
    celRodape.font = { name: "Arial", size: 8, italic: true, color: { argb: "FF94A3B8" } };
    celRodape.alignment = { horizontal: "center" };

    // Download
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_patrimonio_isepam.xlsx";
    a.click();
    URL.revokeObjectURL(url);
}

async function gerarExcelChamados() {
    const ini = document.getElementById("dataInicio").value;
    const fim = document.getElementById("dataFim").value;
    const filtroResultado = document.getElementById("filtroResultadoChamado").value;

    let filtrados = chamados.filter(c => {
        const dataChamado = c.data.split(' ')[0];
        const [dia, mes, ano] = dataChamado.split('/');
        const dataISO = `${ano}-${mes}-${dia}`;
        const dataOk = (!ini || dataISO >= ini) && (!fim || dataISO <= fim);
        let resultadoOk = true;
        if (filtroResultado === 'Concluído') resultadoOk = c.status === 'Concluído';
        else if (filtroResultado === 'Não reparado') resultadoOk = c.status === 'Não reparado';
        return dataOk && resultadoOk;
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = "ISEPAM";
    const ws = wb.addWorksheet("Chamados");

    ws.columns = [
        { key: "data",          width: 18 },
        { key: "patrimonio",    width: 14 },
        { key: "descricao",     width: 36 },
        { key: "status",        width: 14 },
        { key: "tecnico",       width: 20 },
        { key: "resolucao",     width: 36 },
        { key: "dataConclusao", width: 18 },
    ];

    // Título
    ws.mergeCells("A1:G1");
    const titulo = ws.getCell("A1");
    titulo.value = "ISEPAM — Relatório de Chamados de Manutenção";
    titulo.font = { name: "Arial", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
    titulo.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
    titulo.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(1).height = 32;

    // Subtítulo
    ws.mergeCells("A2:G2");
    const sub = ws.getCell("A2");
    sub.value = `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})}   |   Total de chamados: ${filtrados.length}`;
    sub.font = { name: "Arial", size: 9, color: { argb: "FFFFFFFF" } };
    sub.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1D4ED8" } };
    sub.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(2).height = 20;

    // Cabeçalho
    const cabecalho = ws.addRow(["Data", "Patrimônio", "Descrição", "Status", "Técnico", "Resolução", "Data Conclusão"]);
    cabecalho.eachCell(cell => {
        cell.font = { name: "Arial", bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E2937" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = { bottom: { style: "thin", color: { argb: "FF2563EB" } } };
    });
    ws.getRow(3).height = 22;

    // Cores por status
    const corStatus = {
        "Concluído":    { argb: "FFD1FAE5" },
        "Em andamento": { argb: "FFFEF3C7" },
        "Não reparado": { argb: "FFFEE2E2" },
        "Aberto":       { argb: "FFE0E7FF" },
    };

    filtrados.forEach((c, i) => {
        const row = ws.addRow([
            c.data,
            c.patrimonio,
            c.descricao,
            c.status,
            c.tecnico || "—",
            c.feedback || "—",
            c.dataConclusao || "—"
        ]);

        const bgPadrao = i % 2 === 0 ? "FFF8FAFC" : "FFFFFFFF";
        row.eachCell((cell, colIndex) => {
            // Coluna de status recebe cor temática
            const bg = colIndex === 4 ? (corStatus[c.status] || { argb: bgPadrao }) : { argb: bgPadrao };
            cell.font = { name: "Arial", size: 9 };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: bg };
            cell.alignment = { vertical: "middle", wrapText: colIndex === 3 || colIndex === 6 };
            cell.border = { bottom: { style: "hair", color: { argb: "FFE2E8F0" } } };
        });
        row.height = 18;
    });

    // Rodapé
    ws.addRow([]);
    ws.addRow([`ISEPAM — Sistema de Gestão de Patrimônio • Página gerada automaticamente`]);
    ws.mergeCells(`A${ws.rowCount}:G${ws.rowCount}`);
    const celRodape = ws.getCell(`A${ws.rowCount}`);
    celRodape.font = { name: "Arial", size: 8, italic: true, color: { argb: "FF94A3B8" } };
    celRodape.alignment = { horizontal: "center" };

    // Download
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_chamados_isepam.xlsx";
    a.click();
    URL.revokeObjectURL(url);
}

function mudarAbaRelatorio(e, id) {
    document.querySelectorAll('.conteudo-aba').forEach(a => a.classList.add('escondido'));
    document.querySelectorAll('.aba-btn').forEach(b => b.classList.remove('ativa'));
    document.getElementById(id).classList.remove('escondido');
    e.currentTarget.classList.add('ativa');

    const filtros = document.getElementById("filtrosRelatorio");
    if (id === 'abaEstatisticas') {
        filtros.style.display = 'none';
        atualizarEstatisticas();
    } else {
        filtros.style.display = 'flex';
    }

    document.getElementById("cabecalhoRelatorio").innerHTML = "";
    document.getElementById("corpoRelatorio").innerHTML = "";
}

function adicionarCabecalhoPDF(doc, titulo) {
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("ISEPAM", 20, 18);
    doc.setFontSize(14);
    doc.text("Sistema de Gestão de Patrimônio", 20, 26);
    doc.setFontSize(16);
    doc.text(titulo, 20, 33);
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}`, 20, 45);
}

function adicionarRodapePDF(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(9);
    doc.setTextColor(100);
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Página ${i} de ${pageCount} • ISEPAM - Patrimônio`, 105, 290, { align: 'center' });
    }
}

function gerarRelatorioChamados() {
    const ini = document.getElementById("dataInicio").value;
    const fim = document.getElementById("dataFim").value;
    const filtroResultado = document.getElementById("filtroResultadoChamado").value;

    let filtrados = chamados.filter(c => {
        const dataChamado = c.data.split(' ')[0];
        const [dia, mes, ano] = dataChamado.split('/');
        const dataISO = `${ano}-${mes}-${dia}`;
        const dataOk = (!ini || dataISO >= ini) && (!fim || dataISO <= fim);
        
        let resultadoOk = true;
        if (filtroResultado === 'Concluído') {
            resultadoOk = c.status === 'Concluído';
        } else if (filtroResultado === 'Não reparado') {
            resultadoOk = c.status === 'Não reparado';
        }
        return dataOk && resultadoOk;
    });

    document.getElementById("cabecalhoRelatorio").innerHTML = `
        <table>
            <th>Data</th>
            <th>Patrimônio</th>
            <th>Descrição</th>
            <th>Status</th>
            <th>Técnico</th>
            <th>Resolução</th>
        </table>`;

    const html = filtrados.map(c => `
        <tr>
            <td>${escapeHTML(c.data)}</td>
            <td>${escapeHTML(c.patrimonio)}</td>
            <td>${escapeHTML(c.descricao.length > 60 ? c.descricao.substring(0,57) + '...' : c.descricao)}</td>
            <td>${escapeHTML(c.status)}</td>
            <td>${escapeHTML(c.tecnico || '—')}</td>
            <td>${c.feedback ? escapeHTML(c.feedback.substring(0, 50)) : '—'}</td>
        </tr>
    `).join('');

    document.getElementById("corpoRelatorio").innerHTML = html || 
        `<tr><td colspan="6" style="text-align:center; padding:50px; color:#64748b;">Nenhum chamado encontrado.</td></tr>`;
}

function gerarPDFChamados() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    adicionarCabecalhoPDF(doc, "Relatório de Chamados de Manutenção");

    const ini = document.getElementById("dataInicio").value;
    const fim = document.getElementById("dataFim").value;
    const filtroResultado = document.getElementById("filtroResultadoChamado").value;

    let filtrados = chamados.filter(c => {
        const dataChamado = c.data.split(' ')[0];
        const [dia, mes, ano] = dataChamado.split('/');
        const dataISO = `${ano}-${mes}-${dia}`;
        const dataOk = (!ini || dataISO >= ini) && (!fim || dataISO <= fim);
        
        let resultadoOk = true;
        if (filtroResultado === 'Concluído') {
            resultadoOk = c.status === 'Concluído';
        } else if (filtroResultado === 'Não reparado') {
            resultadoOk = c.status === 'Não reparado';
        }
        return dataOk && resultadoOk;
    });

    const tabela = filtrados.map(c => [
        c.data,
        c.patrimonio,
        c.descricao.length > 45 ? c.descricao.substring(0,42) + "..." : c.descricao,
        c.status,
        c.tecnico || "—",
        c.feedback ? (c.feedback.length > 40 ? c.feedback.substring(0,37) + "..." : c.feedback) : "—"
    ]);

    doc.autoTable({
        startY: 55,
        head: [['Data', 'Patrimônio', 'Problema', 'Status', 'Técnico', 'Resolução']],
        body: tabela,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [37, 99, 235] }
    });

    adicionarRodapePDF(doc);
    doc.save("relatorio_chamados_isepam.pdf");
}

function gerarRelatorioAtividades() {
    const ini = document.getElementById("dataInicio").value;
    const fim = document.getElementById("dataFim").value;

    let filtrados = atividades.filter(a => {
        const dataAtividade = a.data.split(' ')[0];
        const [dia, mes, ano] = dataAtividade.split('/');
        const dataISO = `${ano}-${mes}-${dia}`;
        return (!ini || dataISO >= ini) && (!fim || dataISO <= fim);
    });

    document.getElementById("cabecalhoRelatorio").innerHTML = `<table><th>Data e Hora</th><th>Atividade Registrada</th></tr>`;
    
    const html = filtrados.map(a => `
        <tr>
            <td>${escapeHTML(a.data)}</td>
            <td>${escapeHTML(a.texto)}</td>
        </tr>
    `).join('');

    document.getElementById("corpoRelatorio").innerHTML = html || 
        `<tr><td colspan="2" style="text-align:center; padding:50px; color:#64748b;">Nenhuma atividade encontrada.</td></tr>`;
}

function gerarPDFAtividades() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    adicionarCabecalhoPDF(doc, "Log de Atividades do Sistema");

    const ini = document.getElementById("dataInicio").value;
    const fim = document.getElementById("dataFim").value;

    let filtrados = atividades.filter(a => {
        const dataAtividade = a.data.split(' ')[0];
        const [dia, mes, ano] = dataAtividade.split('/');
        const dataISO = `${ano}-${mes}-${dia}`;
        return (!ini || dataISO >= ini) && (!fim || dataISO <= fim);
    });

    const tabela = filtrados.map(a => [a.data, a.texto]);

    doc.autoTable({
        startY: 55,
        head: [['Data/Hora', 'Descrição da Atividade']],
        body: tabela,
        theme: 'grid',
        styles: { fontSize: 9 }
    });

    adicionarRodapePDF(doc);
    doc.save("relatorio_atividades_isepam.pdf");
}

// ====================== ESTATÍSTICAS ======================
let chartCategoria = null;
let chartEstado = null;

function atualizarEstatisticas() {
    const valorTotal = bens.reduce((acc, b) => acc + parseFloat(b.valor || 0), 0);
    
    document.getElementById("valorTotalPatrimonio").innerText = 
        valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById("totalBensEstat").innerText = bens.length;

    const porCategoria = {};
    bens.forEach(b => {
        porCategoria[b.categoria] = (porCategoria[b.categoria] || 0) + 1;
    });

    const labelsCat = Object.keys(porCategoria);
    const dataCat = Object.values(porCategoria);
    const coresCat = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    const porEstado = {};
    bens.forEach(b => {
        porEstado[b.estado] = (porEstado[b.estado] || 0) + 1;
    });

    const labelsEst = Object.keys(porEstado);
    const dataEst = Object.values(porEstado);
    const coresEst = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

    if (chartCategoria) chartCategoria.destroy();
    if (chartEstado) chartEstado.destroy();

    const ctxCat = document.getElementById('graficoCategoria').getContext('2d');
    chartCategoria = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
            labels: labelsCat,
            datasets: [{
                data: dataCat,
                backgroundColor: coresCat.slice(0, labelsCat.length),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${context.raw} itens`
                    }
                }
            }
        }
    });

    const ctxEst = document.getElementById('graficoEstado').getContext('2d');
    chartEstado = new Chart(ctxEst, {
        type: 'doughnut',
        data: {
            labels: labelsEst,
            datasets: [{
                data: dataEst,
                backgroundColor: coresEst.slice(0, labelsEst.length),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${context.raw} itens`
                    }
                }
            }
        }
    });
}

// ====================== DASHBOARD ======================
function atualizarDashboard() {
    document.getElementById("totalBens").innerText = bens.length;
    document.getElementById("totalChamados").innerText = chamados.length;
    document.getElementById("emAndamento").innerText = chamados.filter(c => c.status === "Em andamento").length;
}


// ====================== MENU MOBILE ======================
function initMobileMenu() {
    const btnMenu = document.getElementById('btnMenuMobile');
    const menu = document.querySelector('.menu');

    if (!btnMenu || !menu) return;

    let overlay = document.getElementById('menuOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'menuOverlay';
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
    }

    function abrirMenu() {
        menu.classList.add('open');
        overlay.classList.add('ativo');
        btnMenu.textContent = '✕';
    }

    function fecharMenu() {
        menu.classList.remove('open');
        overlay.classList.remove('ativo');
        btnMenu.textContent = '☰';
    }

    // Remove listeners antigos
    const btnClone = btnMenu.cloneNode(true);
    btnMenu.parentNode.replaceChild(btnClone, btnMenu);

    // Clique no hambúrguer
    btnClone.addEventListener('click', function(e) {
        e.stopPropagation();
        if (menu.classList.contains('open')) {
            fecharMenu();
        } else {
            abrirMenu();
        }
    });

    // Fecha ao clicar no overlay (área escura)
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            fecharMenu();
        }
    });

    // Fecha o menu ao clicar em qualquer botão do menu (no mobile)
    document.querySelectorAll('.menu nav button').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                fecharMenu();
            }
        });
    });

    // Fecha menu ao redimensionar para desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            fecharMenu();
        }
    });
}
document.addEventListener('DOMContentLoaded', initMobileMenu);

// ====================== TOAST ======================
function showToast(mensagem, tipo = "success") {
    const container = document.getElementById("toastContainer");
    
    const toast = document.createElement("div");
    toast.className = `toast ${tipo}`;
    
    let icone = "";
    if (tipo === "success") icone = "✅";
    else if (tipo === "error") icone = "❌";
    else if (tipo === "info") icone = "ℹ️";

    toast.innerHTML = `<span>${icone}</span><span>${escapeHTML(mensagem)}</span>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function toggleSenha(inputId, olho) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        olho.textContent = '🙈';
    } else {
        input.type = 'password';
        olho.textContent = '👁';
    }
}
