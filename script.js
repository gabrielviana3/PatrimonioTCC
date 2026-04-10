// ====================== DADOS ======================
let bens = JSON.parse(localStorage.getItem("bens")) || [];
let chamados = JSON.parse(localStorage.getItem("chamados")) || [];
let filtroChamadoAtual = 'Todos';
let atividades = JSON.parse(localStorage.getItem("atividades")) || [];
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [
    { id: 1, nome: "Administrador", email: "admin@isepam.edu.br", senha: "123", role: "admin" },
    { id: 2, nome: "Técnico", email: "tecnico@isepam.edu.br", senha: "123", role: "tecnico" }
];

let usuarioLogado = "";
let usuarioRole = "";

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
        mostrarTela('chamados');
        renderizarChamados('Em andamento');
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") fecharModal();
    });

    configurarNavegacaoEnter();

    // ========== PREVIEW DA FOTO NO CHAMADO ==========
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

        // Não interfere em textarea, botões, links
        if (tag === 'textarea' || tag === 'button' || tag === 'a' || (tag === 'input' && ativo.type === 'submit')) {
            return;
        }

        e.preventDefault(); // só para inputs e selects

        // ---- LOGIN ----
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

        // ---- CADASTRO DE BEM ----
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

        // ---- INVENTÁRIO ----
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

        // ---- CHAMADOS ----
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

        // ---- RELATÓRIOS ----
        if (!document.getElementById("relatorio").classList.contains("escondido")) {
            const abaAtiva = document.querySelector('.conteudo-aba:not(.escondido)');
            if (abaAtiva && abaAtiva.id === "abaItens") {
                const campos = ["dataInicio", "dataFim", "filtroCategoriaPDF", "filtroEstadoPDF"];
                const idx = campos.indexOf(ativo.id);
                if (idx !== -1 && idx < campos.length - 1) {
                    document.getElementById(campos[idx+1]).focus();
                } else if (idx === campos.length - 1) {
                    gerarRelatorioItens();
                }
            }
            return;
        }
    });
}

// ====================== LOGIN E CADASTRO ======================
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
        alert("Preencha todos os campos obrigatórios!");
        return;
    }
    if (usuarios.some(u => u.email === email)) {
        alert("Este email já está cadastrado!");
        return;
    }

    usuarios.push({ id: Date.now(), nome, email, senha, role });
    salvarUsuarios();
    alert("Conta criada com sucesso!");
    voltarParaLogin();
    document.getElementById("email").value = email;
    document.getElementById("senha").focus();
}

function login() {
    const email = document.getElementById("email").value.trim().toLowerCase();
    const senha = document.getElementById("senha").value;

    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    
    if (usuario) {
        usuarioLogado = usuario.nome;
        usuarioRole = usuario.role;

        // Esconde tela de login
        document.getElementById("loginTela").classList.add("escondido");

        // Mostra overlay de carregamento
        let loading = document.getElementById("loadingOverlay");
        if (!loading) {
            loading = document.createElement("div");
            loading.id = "loadingOverlay";
            loading.className = "loading-overlay";
            loading.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-text">Carregando sistema...</div>
                <div style="margin-top:10px; font-size:13px; opacity:0.7;">Bem-vindo, ${usuario.nome.split(' ')[0]}!</div>
            `;
            document.body.appendChild(loading);
        }
        loading.style.display = "flex";

        // Simula carregamento + animação de entrada
        setTimeout(() => {
            document.getElementById("sistema").classList.remove("escondido");
            
            // Pequeno delay para a transição funcionar
            setTimeout(() => {
                document.getElementById("sistema").classList.add("show");
            }, 50);

            document.getElementById("usuarioInfo").innerText = `Olá, ${usuario.nome}`;
            
            loading.style.display = "none";
            
            // Mostra dashboard com animação suave
            mostrarTela('dashboard');
            
            registrarAtividade(`Login realizado: ${usuario.nome}`);
            
        }, 1800); // 1.8 segundos de "carregamento"

    } else {
        alert("Email ou senha incorretos!");
    }
}

function logout() {
    if (confirm("Deseja realmente sair?")) location.reload();
}

// ====================== NAVEGAÇÃO ======================
function mostrarTela(id) {
    document.querySelectorAll(".tela").forEach(t => t.classList.add("escondido"));
    const tela = document.getElementById(id);
    if (tela) tela.classList.remove("escondido");

    if (id === 'dashboard') {
        atualizarDashboard();
        renderAtividades();
    }
    if (id === 'bens') filtrarTudo();
    if (id === 'cadastro') {
        setTimeout(() => document.getElementById("numero").focus(), 100);
    }
    if (id === 'chamados') {
    filtrarChamados('Aberto');  // mostra apenas chamados em aberto
    }
    
    // NOVO: Quando a tela de relatório for aberta, verifica se a aba estatísticas está ativa
    if (id === 'relatorio') {
        // Pequeno delay para garantir que o DOM das abas foi atualizado
        setTimeout(() => {
            const abaEstatisticas = document.getElementById("abaEstatisticas");
            if (abaEstatisticas && !abaEstatisticas.classList.contains("escondido")) {
                atualizarEstatisticas();
            }
        }, 100);
    }
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
    container.innerHTML = atividades.length ? 
        atividades.map(a => `<div class="log-item"><small>${a.data}</small><p>${a.texto}</p></div>`).join('') 
        : '<p style="color:#64748b; text-align:center;">Nenhuma atividade recente.</p>';
}

// ====================== CADASTRO DE BENS (COM NOVOS CAMPOS) ======================
function cadastrarBem() {
    const numero = document.getElementById("numero").value.trim();
    const nome = document.getElementById("nome").value.trim();
    const valor = parseFloat(document.getElementById("valor").value) || 0;

    if (!numero || !nome || valor <= 0) {
        alert("Número, Nome e Valor (R$) são obrigatórios!");
        return;
    }

    if (bens.some(b => b.numero === numero)) {
        alert("Já existe um bem com este número de patrimônio!");
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
    
    alert("Bem cadastrado com sucesso!");
    
    // Limpar formulário
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

    document.getElementById("corpoTabela").innerHTML = filtrados.map(b => `
        <tr>
            <td>${b.numero}</td>
            <td>${b.nome}</td>
            <td>R$ ${parseFloat(b.valor).toFixed(2)}</td>
            <td>${b.localizacao}</td>
            <td>${b.estado}</td>
            <td><button onclick="verFicha('${b.numero}')">Ver Ficha</button></td>
        </tr>
    `).join('');
}

function verFicha(num) {
    const item = bens.find(b => b.numero === num);
    if (!item) return;

    document.getElementById("conteudoModal").innerHTML = `
        <h3>Ficha Técnica - ${item.nome}</h3>
        <p><strong>Nº Patrimônio:</strong> ${item.numero}</p>
        <p><strong>Valor:</strong> R$ ${parseFloat(item.valor).toFixed(2)}</p>
        <p><strong>Nota Fiscal:</strong> ${item.notaFiscal || 'Não informada'}</p>
        <p><strong>Fornecedor:</strong> ${item.fornecedor || 'Não informado'}</p>
        <p><strong>Data de Entrada:</strong> ${item.data}</p>
        <p><strong>Localização:</strong> ${item.localizacao}</p>
        <p><strong>Estado:</strong> ${item.estado}</p>
        <p><strong>Categoria:</strong> ${item.categoria}</p>
        <hr>
        <label>Nova Localização:</label>
        <input id="novaLoc" value="${item.localizacao}" style="width:100%; margin:8px 0;">
        <button onclick="salvarNovaLoc('${item.numero}')" style="width:100%; margin-bottom:8px;">Atualizar Localização</button>
        <button onclick="excluirBem('${item.numero}')" style="width:100%; background:#ef4444; color:white;">Excluir Bem</button>
    `;
    document.getElementById("modalGeral").classList.remove("escondido");
}

function salvarNovaLoc(num) {
    const item = bens.find(b => b.numero === num);
    if (!item) return;
    const nova = document.getElementById("novaLoc").value.trim();
    if (nova && nova !== item.localizacao) {
        registrarAtividade(`Movimentação: ${item.nome} → ${nova}`);
        item.localizacao = nova;
        salvar();
        alert("Localização atualizada!");
    }
    fecharModal();
    filtrarTudo();
}

function excluirBem(num) {
    if (!confirm("Tem certeza que deseja excluir este bem permanentemente?")) return;

    bens = bens.filter(b => b.numero !== num);
    registrarAtividade(`Bem excluído: Nº ${num}`);
    salvar();
    fecharModal();
    filtrarTudo();
    atualizarDashboard();
    alert("Bem excluído com sucesso!");
}

// ====================== CHAMADOS (mantido por enquanto) ======================
function abrirChamado() {
    const p = document.getElementById("patrimonioChamado").value.trim();
    const d = document.getElementById("descricaoChamado").value.trim();
    const f = document.getElementById("fotoChamado").files[0];

    if (!p || !d) return alert("Número e descrição são obrigatórios!");

    const salvarChamado = (foto64) => {
        chamados.push({ 
            id: Date.now(), 
            patrimonio: p, 
            descricao: d, 
            foto: foto64, 
            status: "Aberto", 
            tecnico: null, 
            feedback: "", 
            data: new Date().toLocaleString('pt-BR') 
        });
        registrarAtividade(`Chamado aberto para ${p}`);
        salvar();
        
        // ✅ Aplica o filtro atual (ex: 'Aberto') em vez de mostrar todos
        if (typeof filtroChamadoAtual !== 'undefined') {
            filtrarChamados(filtroChamadoAtual);
        } else {
            // Fallback: mostra apenas chamados 'Aberto'
            filtrarChamados('Aberto');
        }
        
        alert("Chamado aberto!");
        
        // Limpa os campos
        document.getElementById("patrimonioChamado").value = "";
        document.getElementById("descricaoChamado").value = "";
        document.getElementById("fotoChamado").value = "";
        
        // Esconde a pré-visualização da foto
        const previewDiv = document.getElementById("previewFoto");
        if (previewDiv) previewDiv.style.display = "none";
        const imgPreview = document.getElementById("imgPreview");
        if (imgPreview) imgPreview.src = "#";
    };

    if (f) {
        const reader = new FileReader();
        reader.onload = e => salvarChamado(e.target.result);
        reader.readAsDataURL(f);
    } else {
        salvarChamado(null);
    }
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

    let lista = filtro ? chamados.filter(c => c.status === filtro) : chamados;

    if (lista.length === 0) {
        container.innerHTML = `<p style="color:#64748b; text-align:center; padding:30px;">Nenhum chamado encontrado.</p>`;
        return;
    }

    container.innerHTML = lista.map(c => `
        <div class="card-chamado">
<span class="badge" style="background:${c.status === 'Concluído' ? '#10b981' : c.status === 'Em andamento' ? '#f59e0b' : c.status === 'Não reparado' ? '#ef4444' : '#3b82f6'}">${c.status}</span>
            <h4>Patrimônio: ${c.patrimonio}</h4>
            <p>${c.descricao}</p>
            ${c.foto ? `<img src="${c.foto}" style="max-width:120px; border-radius:6px; cursor: pointer;" onclick="ampliarFoto('${c.foto}')">` : ''}
            ${c.feedback ? `<div class="feedback"><strong>Resolução:</strong> ${c.feedback}</div>` : ''}
            <div class="acoes-card">
                ${c.status === 'Aberto' ? `<button onclick="aceitarChamado(${c.id})">Aceitar</button>` : ''}
                ${c.status === 'Em andamento' ? `<button onclick="abrirModalFeedback(${c.id})" style="background:#10b981;">Finalizar</button>` : ''}
            </div>
        </div>
    `).join('');
}

// Funções de chamados restantes (aceitar, finalizar, etc.) - mantidas simples por enquanto
function aceitarChamado(id) {
    const c = chamados.find(ch => ch.id === id);
    if (c) {
        c.status = "Em andamento";
        c.tecnico = usuarioLogado;
        salvar();
        // Muda o filtro automaticamente para "Em andamento"
        filtrarChamados('Em andamento');
    }
}

function abrirModalFeedback(id) {
    document.getElementById("conteudoModal").innerHTML = `
        <h3>Finalizar Chamado</h3>
        <textarea id="feedbackTexto" placeholder="Descreva o que foi feito..." rows="4" style="width:100%; margin-bottom:12px;"></textarea>
        <div style="display:flex; gap:12px;">
            <button onclick="concluirChamado(${id}, 'Concluído')" style="flex:1; background:#10b981;">✅ Sucesso</button>
            <button onclick="concluirChamado(${id}, 'Não reparado')" style="flex:1; background:#ef4444;">❌ Falha</button>
        </div>
        <button onclick="fecharModal()" style="margin-top:12px; width:100%; background:#64748b;">Cancelar</button>
    `;
    document.getElementById("modalGeral").classList.remove("escondido");
}

function concluirChamado(id, novoStatus) {
    const feedback = document.getElementById("feedbackTexto").value.trim();
    if (!feedback) return alert("O feedback é obrigatório!");
    const c = chamados.find(ch => ch.id === id);
    if (c) {
        c.status = novoStatus;
        c.feedback = feedback;
        registrarAtividade(`Chamado ${novoStatus === 'Concluído' ? 'concluído' : 'encerrado sem reparo'} para ${c.patrimonio}`);
        salvar();
        fecharModal();
        // Muda o filtro para o status resultante
        filtrarChamados(novoStatus);
    }
}

function filtrarChamados(status) {
    filtroChamadoAtual = status;
    renderizarChamados(status === 'todos' ? null : status);
    
    // Atualiza a classe ativa nos botões (opcional, mas recomendado)
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
        <div style="text-align: center;">
            <img src="${url}" style="max-width: 100%; max-height: 80vh; border-radius: 12px;">
            <br><br>
            <button onclick="fecharModal()" style="background: #2563eb;">Fechar</button>
        </div>
    `;
    modal.classList.remove("escondido");
}

// ====================== RELATÓRIOS MELHORADOS ======================

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

    // Cabeçalho
    document.getElementById("cabecalhoRelatorio").innerHTML = `
        <tr>
            <th>Data</th>
            <th>Nº Patrimônio</th>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Valor</th>
            <th>Localização</th>
            <th>Estado</th>
        </tr>`;

    // Corpo
    let html = filtrados.map(b => `
        <tr>
            <td>${b.data}</td>
            <td>${b.numero}</td>
            <td>${b.nome}</td>
            <td>${b.categoria}</td>
            <td>R$ ${parseFloat(b.valor).toFixed(2)}</td>
            <td>${b.localizacao}</td>
            <td>${b.estado}</td>
        </tr>
    `).join('');

    document.getElementById("corpoRelatorio").innerHTML = html || 
        `<tr><td colspan="7" style="text-align:center; padding:40px; color:#64748b;">Nenhum bem encontrado com os filtros aplicados.</td></tr>`;
}

function gerarPDFItens() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Relatório de Patrimônio - ISEPAM", 20, 20);
    
    doc.setFontSize(11);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);

    // Tabela manual (melhor que texto solto)
    let y = 45;
    doc.setFontSize(10);

    // Cabeçalho da tabela
    doc.setFillColor(37, 99, 235);
    doc.rect(20, y, 170, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.text("Nº", 25, y+6);
    doc.text("Nome do Bem", 45, y+6);
    doc.text("Categoria", 110, y+6);
    doc.text("Valor (R$)", 150, y+6);
    y += 10;

    doc.setTextColor(0);

    bens.forEach((b, i) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        doc.text(b.numero, 25, y);
        doc.text(b.nome.length > 35 ? b.nome.substring(0,32)+"..." : b.nome, 45, y);
        doc.text(b.categoria, 110, y);
        doc.text(parseFloat(b.valor).toFixed(2), 150, y);
        y += 8;
    });

    // Total no final
    const valorTotal = bens.reduce((sum, b) => sum + parseFloat(b.valor || 0), 0);
    doc.setFontSize(12);
    doc.text(`Valor Total do Patrimônio: R$ ${valorTotal.toFixed(2)}`, 20, y + 15);

    doc.save("relatorio_patrimonio_isepam.pdf");
}

// ====================== RELATÓRIOS REFINADOS ======================

function mudarAbaRelatorio(e, id) {
    // Esconde todas as abas de conteúdo
    document.querySelectorAll('.conteudo-aba').forEach(a => a.classList.add('escondido'));
    // Remove a classe ativa de todos os botões
    document.querySelectorAll('.aba-btn').forEach(b => b.classList.remove('ativa'));
    // Mostra a aba selecionada
    document.getElementById(id).classList.remove('escondido');
    e.currentTarget.classList.add('ativa');

    // Controla a visibilidade dos filtros de data
    const filtros = document.getElementById("filtrosRelatorio");
    if (id === 'abaEstatisticas') {
        filtros.style.display = 'none';
        atualizarEstatisticas(); // <-- CARREGA AUTOMATICAMENTE
    } else {
        filtros.style.display = 'flex';
    }

    // Limpa a tabela de preview ao trocar de aba
    document.getElementById("cabecalhoRelatorio").innerHTML = "";
    document.getElementById("corpoRelatorio").innerHTML = "";
}

// Cabeçalho bonito para todos os PDFs
function adicionarCabecalhoPDF(doc, titulo) {
    doc.setFillColor(37, 99, 235); // Cor azul principal
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

// Rodapé com número da página
function adicionarRodapePDF(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(9);
    doc.setTextColor(100);
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Página ${i} de ${pageCount} • ISEPAM - Patrimônio`, 105, 290, { align: 'center' });
    }
}

// ====================== ABA PATRIMÔNIO ======================
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
        <tr>
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
            <td>${b.data}</td>
            <td>${b.numero}</td>
            <td>${b.nome}</td>
            <td>${b.categoria}</td>
            <td>R$ ${parseFloat(b.valor).toFixed(2)}</td>
            <td>${b.localizacao}</td>
            <td>${b.estado}</td>
        </tr>
    `).join('');

    document.getElementById("corpoRelatorio").innerHTML = html || 
        `<tr><td colspan="7" style="text-align:center; padding:50px; color:#64748b;">Nenhum bem encontrado com os filtros aplicados.</td></tr>`;
}

function gerarPDFItens() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    adicionarCabecalhoPDF(doc, "Relatório de Patrimônio");

    const valorTotal = bens.reduce((acc, b) => acc + parseFloat(b.valor || 0), 0);

    doc.setFontSize(12);
    doc.text(`Total de Bens: ${bens.length}   |   Valor Total do Patrimônio: R$ ${valorTotal.toFixed(2)}`, 20, 55);

    // Preparar dados da tabela
    const tabela = bens.map(b => [
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

// ====================== ABA CHAMADOS ======================
function gerarRelatorioChamados() {
    document.getElementById("cabecalhoRelatorio").innerHTML = `
        <tr>
            <th>Data</th>
            <th>Patrimônio</th>
            <th>Descrição</th>
            <th>Status</th>
            <th>Técnico</th>
            <th>Resolução</th>
        </tr>`;

    const html = chamados.map(c => `
        <tr>
            <td>${c.data}</td>
            <td>${c.patrimonio}</td>
            <td>${c.descricao.length > 60 ? c.descricao.substring(0,57) + '...' : c.descricao}</td>
            <td>${c.status}</td>
            <td>${c.tecnico || '—'}</td>
            <td>${c.feedback ? 'Sim' : '—'}</td>
        </tr>
    `).join('');

    document.getElementById("corpoRelatorio").innerHTML = html || 
        `<tr><td colspan="6" style="text-align:center; padding:50px; color:#64748b;">Nenhum chamado registrado ainda.</td></tr>`;
}

function gerarPDFChamados() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    adicionarCabecalhoPDF(doc, "Relatório de Chamados de Manutenção");

    const tabela = chamados.map(c => [
        c.data,
        c.patrimonio,
        c.descricao.length > 45 ? c.descricao.substring(0,42) + "..." : c.descricao,
        c.status,
        c.tecnico || "—",
        c.feedback ? "Concluído" : "Pendente"
    ]);

    doc.autoTable({
        startY: 55,
        head: [['Data', 'Patrimônio', 'Problema', 'Status', 'Técnico', 'Situação']],
        body: tabela,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [37, 99, 235] }
    });

    adicionarRodapePDF(doc);
    doc.save("relatorio_chamados_isepam.pdf");
}

// ====================== ABA ATIVIDADES ======================
function gerarRelatorioAtividades() {
    document.getElementById("cabecalhoRelatorio").innerHTML = `<tr><th>Data e Hora</th><th>Atividade Registrada</th></tr>`;
    
    const html = atividades.map(a => `
        <tr><td>${a.data}</td><td>${a.texto}</td></tr>
    `).join('');

    document.getElementById("corpoRelatorio").innerHTML = html || 
        `<tr><td colspan="2" style="text-align:center; padding:50px; color:#64748b;">Nenhuma atividade registrada.</td></tr>`;
}

function gerarPDFAtividades() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    adicionarCabecalhoPDF(doc, "Log de Atividades do Sistema");

    const tabela = atividades.map(a => [a.data, a.texto]);

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

// ====================== ABA ESTATÍSTICAS ======================
let chartCategoria = null;
let chartEstado = null;

function atualizarEstatisticas() {
    const valorTotal = bens.reduce((acc, b) => acc + parseFloat(b.valor || 0), 0);
    
    document.getElementById("valorTotalPatrimonio").innerText = `R$ ${valorTotal.toFixed(2)}`;
    document.getElementById("totalBensEstat").innerText = bens.length;

    // Preparar dados por Categoria
    const porCategoria = {};
    bens.forEach(b => {
        porCategoria[b.categoria] = (porCategoria[b.categoria] || 0) + 1;
    });

    const labelsCat = Object.keys(porCategoria);
    const dataCat = Object.values(porCategoria);
    const coresCat = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    // Preparar dados por Estado
    const porEstado = {};
    bens.forEach(b => {
        porEstado[b.estado] = (porEstado[b.estado] || 0) + 1;
    });

    const labelsEst = Object.keys(porEstado);
    const dataEst = Object.values(porEstado);
    const coresEst = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

    // Destruir gráficos antigos se existirem (evita erro ao atualizar)
    if (chartCategoria) chartCategoria.destroy();
    if (chartEstado) chartEstado.destroy();

    // Criar Gráfico de Categoria (Pizza)
    const ctxCat = document.getElementById('graficoCategoria').getContext('2d');
    chartCategoria = new Chart(ctxCat, {
        type: 'doughnut',   // ou 'pie' se preferir
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

    // Criar Gráfico de Estado (Pizza)
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

// ====================== UTILITÁRIOS ======================
function atualizarDashboard() {
    document.getElementById("totalBens").innerText = bens.length;
    document.getElementById("totalChamados").innerText = chamados.length;
    document.getElementById("emAndamento").innerText = chamados.filter(c => c.status === "Em andamento").length;
}

function fecharModal() {
    document.getElementById("modalGeral").classList.add("escondido");
}   

// ====================== RESPONSIVIDADE - MENU MOBILE (VERSÃO MELHORADA) ======================
function initMobileMenu() {
    const btnMenu = document.getElementById('btnMenuMobile');
    const menu = document.querySelector('.menu');

    if (!btnMenu || !menu) {
        console.warn("Elemento do menu mobile não encontrado");
        return;
    }

    // Toggle do menu
    btnMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('open');
    });

    // Fechar ao clicar em um item do menu
    document.querySelectorAll('.menu button').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.innerWidth <= 992) {
                menu.classList.remove('open');
            }
        });
    });

    // Fechar ao clicar fora do menu
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992 && 
            !menu.contains(e.target) && 
            e.target !== btnMenu) {
            menu.classList.remove('open');
        }
    });

    // Fechar automaticamente ao redimensionar para desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) {
            menu.classList.remove('open');
        }
    });
}

// Executa quando o DOM estiver totalmente carregado
document.addEventListener('DOMContentLoaded', initMobileMenu);
