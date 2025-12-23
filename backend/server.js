const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data.json');


function lerBanco() {
  const dados = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(dados);
}

function salvarBanco(dados) {
  fs.writeFileSync(dbPath, JSON.stringify(dados, null, 2));
}


let { contas, transacoes } = lerBanco();



app.post('/api/transferir', (req, res) => {
  const { origemId, destinoId, valor } = req.body;
  const origem = contas.find(c => c.id === origemId);
  const destino = contas.find(c => c.id === destinoId);

  if (!origem || !destino) return res.status(400).json({ erro: "Conta não encontrada" });
  if (origem.saldo < valor) return res.status(400).json({ erro: "Saldo insuficiente" });

  origem.saldo -= valor;
  destino.saldo += valor;

  const codigo = 'TX-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  const transacao = { codigo, origem: origem.nome, destino: destino.nome, valor, data: new Date() };
  transacoes.push(transacao);
  salvarBanco({ contas, transacoes });

  res.json({ mensagem: "Transferência realizada com sucesso", codigo });
});


app.get('/api/extrato', (req, res) => {
  res.json(transacoes.slice(-10));
});


app.get('/api/saldo/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const conta = contas.find(c => c.id === id);
  if (!conta) return res.status(404).json({ erro: "Conta não encontrada" });

  const ultimasTransacoes = transacoes.filter(t => t.origem === conta.nome || t.destino === conta.nome).slice(-10);
  res.json({ saldo: conta.saldo, transacoes: ultimasTransacoes });
});

app.post('/api/clientes', (req, res) => {
  const { nome, saldo } = req.body;
  if (!nome || saldo == null) {
    return res.status(400).json({ erro: "Nome e saldo são obrigatórios." });
  }

  const novoId = contas.length + 1;
  const novoCliente = { id: novoId, nome, saldo: parseFloat(saldo) };
  contas.push(novoCliente);
  salvarBanco({ contas, transacoes });

  res.json({ mensagem: "Cliente cadastrado com sucesso!", cliente: novoCliente });
});


app.get('/api/clientes', (req, res) => {
  res.json(contas);
});


app.delete('/api/clientes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = contas.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ erro: "Cliente não encontrado." });
  }

  const removido = contas.splice(index, 1);
  salvarBanco({ contas, transacoes });
  res.json({ mensagem: `Cliente ${removido[0].nome} removido com sucesso!` });
});


app.listen(3000, () => console.log("Backend rodando em http://localhost:3000"));
