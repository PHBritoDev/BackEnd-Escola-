const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json')

app.use(cors()); // Permite requisições de outras origens
app.use(express.json()); // Permite receber dados no formato JSON

app.use(express.static(__dirname));

function lerBancoDados() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ alunos: [] }, null, 2));
    }

    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
}

// Função auxiliar para salvar no banco de dados
function salvarBancoDados(dados) {
    fs.writeFileSync(DB_FILE, JSON.stringify(dados, null, 2));
}

app.post('/api/alunos', (req, res) => {
    const { nome, email, curso, cpf, idade, telefone } = req.body;

    // Validação
    if (!nome || !email || !curso  || !idade || !cpf || !telefone)  {
        return res.status(400).json({ erro: 'Todos os campos sao obrigatorios!' });
    }

    const db = lerBancoDados();

    // Calcula o próximo ID
    const nextId = db.alunos.length > 0
        ? Math.max(...db.alunos.map(a => a.id)) + 1
        : 1;

    const novoAluno = {
        id: nextId,
        nome,
        email,
        curso,
        idade,
        cpf,
        telefone
    };

    db.alunos.push(novoAluno);
    salvarBancoDados(db); // Salva a alteração no arquivo db.

    res.status(201).json(novoAluno);
});

// READ (Ler/Listar - GET)
app.get("/api/alunos", (req, res) => {
    const db = lerBancoDados();
    res.json(db.alunos);
});

// UPDATE (Atualizar - PUT)
app.put("/api/alunos/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { nome, email, curso, idade, cpf, telefone } = req.body;

    const db = lerBancoDados();
    const index = db.alunos.findIndex(a => a.id === id);

    if (index === -1) {
        return res.status(404).json({ erro: "Aluno nao encontrado" });
    }

    db.alunos[index] = { ...db.alunos[index], nome, email, curso, idade, cpf, telefone };
    salvarBancoDados(db); // Salva a alteração no arquivo

    res.json(db.alunos[index]);
});

// DELETE (Deletar - DELETE)
app.delete('/api/alunos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const db = lerBancoDados();
    const index = db.alunos.findIndex(a => a.id === id);

    if (index === -1) {
        return res.status(404).json({ erro: 'Aluno nao encontrado!' });
    }

    db.alunos.splice(index, 1); // Remove o aluno da lista
    salvarBancoDados(db); // Salva a alteração no arquivo

    res.status(204).send();
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`👉 Acesse: http://localhost:${PORT}`);
    console.log(`📁 Banco de dados local ativo no arquivo db.json`);
});