const API_URL = "http://localhost:3000/api/alunos";

const form = document.getElementById('aluno-form');
const tbody = document.getElementById('aluno-tbody');
const btnCancel = document.getElementById('aluno-cancel');
const btnSave = document.getElementById('aluno-save');

// Campos do form
const inputId = document.getElementById('aluno-id');
const inputNome = document.getElementById('nome');
const inputEmail = document.getElementById('email');
const inputCurso = document.getElementById('curso');
const inputIdade = document.getElementById('idade');
const inputCpf = document.getElementById('telefone');
const inputTelefone = document.getElementById('cpf');

// Estado local
let editandoId = null;

// 1. LER (GET) Buscar dados do BackEnd e renderizar na tela
async function carregarAlunos() {
    try {
        const resposta = await fetch(API_URL);
        const alunos = await resposta.json();

        tbody.innerHTML = "";

        if (alunos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum aluno cadastrado.</td></tr>';
            return;
        }

        alunos.forEach(aluno => {
            const tr = document.createElement("tr");

           tr.innerHTML = `
    <td>#${aluno.id}</td>
    <td>${aluno.nome}</td>
    <td>${aluno.email}</td>
    <td>${aluno.curso}</td>
    <td>${aluno.cpf}</td>
    <td>${aluno.idade}</td>
    <td>${aluno.telefone}</td>
    <td class="actions">
        <button class="btn-icon btn-edit"
            onclick="iniciarEdicao(
                ${aluno.id},
                ${JSON.stringify(aluno.nome)},
                ${JSON.stringify(aluno.email)},
                ${JSON.stringify(aluno.curso)},
                ${JSON.stringify(aluno.cpf)},
                ${JSON.stringify(String(aluno.idade))},
                ${JSON.stringify(aluno.telefone)}
            )">
            Editar
        </button>

        <button class="btn-icon btn-delete"
            onclick="deletarAluno(${aluno.id})">
            Excluir
        </button>
    </td>
`;

            tbody.appendChild(tr);
        });

    } catch (erro) {
        console.error("Erro ao buscar alunos:", erro);
        alert("Erro de conexao com o servidor");
    }
}



// 2. CRIAR OU ATUALIZAR (POST / PUT)
form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evitar recarregar a pagina

  const aluno = {
    nome: inputNome.value,
    email: inputEmail.value,
    curso: inputCurso.value,
    idade: inputIdade.value,
    cpf: inputCpf.value,
    telefone: inputTelefone.value
};

    try {
        if (editandoId) {
            // Se tem um Id, estamos editando (PUT)
            await fetch(`${API_URL}/${editandoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aluno)
            });

            editandoId = null; // Reseta o estado

        } else {
            // Se nao tem ID, estamos criando (POST)
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aluno)
            });
        }

        resetarFormulario();
        carregarAlunos(); // Recarregar a lista atualizada do backend

    } catch (erro) {
        console.error("Erro ao salvar: " + erro);
        alert("Erro ao salvar os dados no servidor!");
    }
});

// 3. PREENCHER O FORM PARA EDITAR (chamado pelo botão "Editar" da tabela)

function iniciarEdicao(id, nome, email, curso, cpf, idade, telefone) {
    editandoId = id;

    inputId.value = id;
    inputNome.value = nome;
    inputEmail.value = email;
    inputCurso.value = curso;
    inputCpf.value = cpf;
    inputIdade.value = idade;
    inputTelefone.value = telefone;

    btnSave.textContent = "Atualizar Aluno";
    btnCancel.style.display = "inline-block";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// 4. CANCELAR EDIÇÃO
btnCancel.addEventListener("click", () => {
    resetarFormulario();
});

// 5. DELETAR (DELETE)
async function deletarAluno(id) {
    const confirmar = confirm("Tem certeza que deseja excluir este aluno?");
    if (!confirmar) return;

    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        // Se estava editando o aluno que foi excluído, reseta o form
        if (editandoId === id) {
            resetarFormulario();
        }

        carregarAlunos();

    } catch (erro) {
        console.error("Erro ao excluir: " + erro);
        alert("Erro ao excluir o aluno no servidor!");
    }
}

// Função auxiliar para limpar o formulário e o estado de edição
function resetarFormulario() {
    editandoId = null;
    form.reset();
    inputId.value = "";
    btnSave.textContent = "Salvar Aluno";
    btnCancel.style.display = "none";
}

// Carrega a lista de alunos assim que a página abre
carregarAlunos();