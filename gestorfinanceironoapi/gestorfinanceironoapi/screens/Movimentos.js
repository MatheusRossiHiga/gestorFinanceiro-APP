import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VERDE_ESCURO } from '../styles/tema';
import { estilos } from '../styles/styles';
import { agora, paraNumero } from '../dados';
import { Botao, Painel, Chip, LinhaTransacao } from '../componentes';

export default function Movimentos({ db, usuario }) {
  const [transacoes, setTransacoes] = useState([]);
  const [contas, setContas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState('T');
  const [busca, setBusca] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('S');
  const [status, setStatus] = useState('C');
  const [contaEscolhida, setContaEscolhida] = useState(null);
  const [categoriaEscolhida, setCategoriaEscolhida] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    const listaTransacoes = await db.getAllAsync(
      `SELECT Transacoes.*, Contas.nm_conta, Categorias.nm_categoria FROM Transacoes
       JOIN Contas ON Contas.cd_conta = Transacoes.id_conta
       JOIN Categorias ON Categorias.cd_categoria = Transacoes.id_categoria
       WHERE Contas.id_usuario = ?
       ORDER BY dt_transacao DESC, cd_transacoes DESC;`,
      [usuario.cd_usuario]
    );
    const listaContas = await db.getAllAsync('SELECT * FROM Contas WHERE id_usuario = ?;', [usuario.cd_usuario]);
    const listaCategorias = await db.getAllAsync('SELECT * FROM Categorias WHERE id_usuario = ?;', [usuario.cd_usuario]);

    setTransacoes(listaTransacoes);
    setContas(listaContas);
    setCategorias(listaCategorias);
    if (listaContas.length > 0 && !contaEscolhida) {
      setContaEscolhida(listaContas[0].cd_conta);
    }
    if (listaCategorias.length > 0 && !categoriaEscolhida) {
      setCategoriaEscolhida(listaCategorias[0].cd_categoria);
    }
  };

  const atualizarSaldo = async (codigoConta, tipoTransacao, valorTransacao, desfazer) => {
    let ajuste = tipoTransacao === 'E' ? valorTransacao : -valorTransacao;
    if (desfazer) {
      ajuste = -ajuste;
    }
    await db.runAsync('UPDATE Contas SET vl_conta_atual = vl_conta_atual + ? WHERE cd_conta = ?;', [ajuste, codigoConta]);
  };

  const salvar = async () => {
    const valorNumerico = paraNumero(valor);
    if (!descricao.trim() || !valorNumerico || valorNumerico <= 0) {
      Alert.alert('Preencha a descrição e o valor');
      return;
    }
    if (!contaEscolhida || !categoriaEscolhida) {
      Alert.alert('Cadastre uma conta e uma categoria primeiro');
      return;
    }
    await db.runAsync(
      'INSERT INTO Transacoes (ds_descricao, vl_transacao, tp_transacao, dt_transacao, st_transacao, id_conta, id_categoria) VALUES (?, ?, ?, ?, ?, ?, ?);',
      [descricao.trim(), valorNumerico, tipo, agora(), status, contaEscolhida, categoriaEscolhida]
    );
    if (status === 'C') {
      await atualizarSaldo(contaEscolhida, tipo, valorNumerico, false);
    }
    setDescricao('');
    setValor('');
    setMostrarForm(false);
    carregar();
  };

  const concluir = async (transacao) => {
    await db.runAsync("UPDATE Transacoes SET st_transacao = 'C' WHERE cd_transacoes = ?;", [transacao.cd_transacoes]);
    await atualizarSaldo(transacao.id_conta, transacao.tp_transacao, transacao.vl_transacao, false);
    carregar();
  };

  const excluir = async (transacao) => {
    if (transacao.st_transacao === 'C') {
      await atualizarSaldo(transacao.id_conta, transacao.tp_transacao, transacao.vl_transacao, true);
    }
    await db.runAsync('DELETE FROM Transacoes WHERE cd_transacoes = ?;', [transacao.cd_transacoes]);
    carregar();
  };

  const confirmarExcluir = (transacao) => {
    Alert.alert('Excluir movimentação?', transacao.ds_descricao, [
      { text: 'Cancelar' },
      { text: 'Excluir', onPress: () => excluir(transacao) },
    ]);
  };

  const transacoesFiltradas = transacoes.filter((transacao) =>
    (filtro === 'T' || transacao.tp_transacao === filtro) &&
    transacao.ds_descricao.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View>
      <Botao texto={mostrarForm ? 'Cancelar' : 'Nova movimentação'} icone="add-circle-outline" onPress={() => setMostrarForm(!mostrarForm)} />

      {mostrarForm && (
        <View style={[estilos.painel, { marginTop: 14 }]}>
          <View style={estilos.campo}>
            <TextInput style={estilos.input} placeholder="Descrição" value={descricao} onChangeText={setDescricao} />
          </View>
          <View style={estilos.campo}>
            <Text style={{ color: '#328553', fontWeight: '700' }}>R$</Text>
            <TextInput style={estilos.input} placeholder="0,00" value={valor} onChangeText={setValor} keyboardType="decimal-pad" />
          </View>

          <View style={estilos.seg}>
            <TouchableOpacity style={[estilos.segItem, tipo === 'S' && { backgroundColor: '#9E4040' }]} onPress={() => setTipo('S')}>
              <Text style={[estilos.segTxt, tipo === 'S' && { color: '#fff' }]}>Saída</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[estilos.segItem, tipo === 'E' && { backgroundColor: '#2E8B57' }]} onPress={() => setTipo('E')}>
              <Text style={[estilos.segTxt, tipo === 'E' && { color: '#fff' }]}>Entrada</Text>
            </TouchableOpacity>
          </View>

          <Text style={estilos.rotulo}>Situação</Text>
          <View style={estilos.linhaChips}>
            <Chip texto="Concluída" ativo={status === 'C'} onPress={() => setStatus('C')} />
            <Chip texto="Pendente" ativo={status === 'P'} onPress={() => setStatus('P')} />
          </View>

          <Text style={estilos.rotulo}>Conta</Text>
          <View style={estilos.linhaChips}>
            {contas.map((conta) => (
              <Chip key={conta.cd_conta} texto={conta.nm_conta} ativo={contaEscolhida === conta.cd_conta} onPress={() => setContaEscolhida(conta.cd_conta)} />
            ))}
          </View>

          <Text style={estilos.rotulo}>Categoria</Text>
          <View style={estilos.linhaChips}>
            {categorias.map((categoria) => (
              <Chip key={categoria.cd_categoria} texto={categoria.nm_categoria} ativo={categoriaEscolhida === categoria.cd_categoria} onPress={() => setCategoriaEscolhida(categoria.cd_categoria)} />
            ))}
          </View>

          <Botao texto="Salvar" onPress={salvar} />
        </View>
      )}

      <View style={[estilos.campo, { marginTop: 14 }]}>
        <Ionicons name="search" size={20} color={VERDE_ESCURO} />
        <TextInput style={estilos.input} placeholder="Pesquisar por descrição" value={busca} onChangeText={setBusca} />
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 14 }}>
        <Chip texto="Todas" ativo={filtro === 'T'} onPress={() => setFiltro('T')} />
        <Chip texto="Entradas" ativo={filtro === 'E'} onPress={() => setFiltro('E')} />
        <Chip texto="Saídas" ativo={filtro === 'S'} onPress={() => setFiltro('S')} />
      </View>

      <Painel titulo={transacoesFiltradas.length + ' movimentações'}>
        {transacoesFiltradas.length === 0 ? (
          <Text style={estilos.vazioTxt}>Nenhuma movimentação encontrada</Text>
        ) : (
          transacoesFiltradas.map((transacao) => (
            <LinhaTransacao
              key={transacao.cd_transacoes}
              transacao={transacao}
              aoConcluir={() => concluir(transacao)}
              aoExcluir={() => confirmarExcluir(transacao)}
            />
          ))
        )}
      </Painel>
    </View>
  );
}
