const API_URL = "http://localhost:3000/api";

function abrirAba(aba) {
  document.querySelectorAll('.conteudo').forEach(c => c.style.display = 'none');
  document.getElementById(aba).style.display = 'block';
}


async function transferir() {
  const origemId = parseInt(document.getElementById('origem').value);
  const destinoId = parseInt(document.getElementById('destino').value);
  const valor = parseFloat(document.getElementById('valor').value);

  const res = await fetch(`${API_URL}/transferir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origemId, destinoId, valor })
  });
  const data = await res.json();
  document.getElementById('resultadoTransferencia').textContent = data.mensagem || data.erro;
}


async function carregarExtrato() {
  const lista = document.getElementById('extratoLista');
  const loading = document.getElementById('loading');
  const semTransacoes = document.getElementById('semTransacoes');

  lista.innerHTML = '';
  loading.style.display = 'block';
  semTransacoes.style.display = 'none';

  try {
    const res = await fetch(`${API_URL}/extrato`);
    const extrato = await res.json();

    loading.style.display = 'none';

    if (extrato.length === 0) {
      semTransacoes.style.display = 'block';
      return;
    }

    extrato.forEach(t => {
      const card = document.createElement('div');
      card.classList.add('transacao-card');
      if (t.valor > 5000) card.classList.add('valor-alto');

      card.innerHTML = `
        <span class="transacao-codigo">Código: ${t.codigo}</span>
        <span>Origem: ${t.origem}</span>
        <span>Destino: ${t.destino}</span>
        <span class="transacao-valor">Valor: R$ ${t.valor.toFixed(2)}</span>
      `;

      lista.appendChild(card);
    });
  } catch (error) {
    loading.style.display = 'none';
    alert("Erro ao carregar extrato.");A
  }
}



async function consultarSaldo() {
  const id = document.getElementById('contaSaldo').value;
  const res = await fetch(`${API_URL}/saldo/${id}`);
  const data = await res.json();
  if (data.erro) {
    document.getElementById('resultadoSaldo').textContent = data.erro;
  } else {
    document.getElementById('resultadoSaldo').textContent = `Saldo atual: R$ ${data.saldo}`;
    const lista = document.getElementById('transacoesSaldo');
    lista.innerHTML = '';
    data.transacoes.forEach(t => {
      const li = document.createElement('li');
      li.textContent = `${t.codigo} - ${t.origem} → ${t.destino} - R$ ${t.valor}`;
      lista.appendChild(li);
    });
  }
}


function validarFormulario() {
  const cpf = document.getElementById('cpf').value;
  const nascimento = document.getElementById('nascimento').value;
  const telefone = document.getElementById('telefone').value;

  if (cpf.length !== 11) return mostrarErro("CPF deve ter 11 dígitos");
  if (!nascimento) return mostrarErro("Informe a data de nascimento");
  if (telefone.length < 9) return mostrarErro("Telefone inválido");

  mostrarSucesso("Todos os dados são válidos!");
}

function mostrarErro(msg) {
  document.getElementById('resultadoValidacao').textContent = msg;
  document.getElementById('resultadoValidacao').style.color = "red";
}

function mostrarSucesso(msg) {
  document.getElementById('resultadoValidacao').textContent = msg;
  document.getElementById('resultadoValidacao').style.color = "green";
}


async function cadastrarCliente() {
  const nome = document.getElementById('nomeCliente').value;
  const saldo = document.getElementById('saldoInicial').value;

  const res = await fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, saldo })
  });

  const data = await res.json();
  document.getElementById('resultadoCadastro').textContent = data.mensagem || data.erro;
}


async function listarClientes() {
  const res = await fetch(`${API_URL}/clientes`);
  const clientes = await res.json();
  const tbody = document.querySelector('#tabelaClientes tbody');
  tbody.innerHTML = '';

  clientes.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.nome}</td>
      <td>R$ ${c.saldo.toFixed(2)}</td>
      <td><button onclick="excluirCliente(${c.id})">Excluir</button></td>
    `;
    tbody.appendChild(tr);
  });
}


async function excluirCliente(id) {
  if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

  const res = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'DELETE'
  });

  const data = await res.json();
  alert(data.mensagem || data.erro);
  listarClientes();
}

