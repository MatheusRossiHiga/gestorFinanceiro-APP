import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VERDE_ESCURO, VERDE } from '../styles/tema';
import { estilos } from '../styles/styles';
import { dinheiro, paraNumero } from '../dados';
import { Botao, Chip } from '../componentes';

const TIPOS_DE_CONTA = ['Carteira', 'Corrente', 'Poupança'];

export default function Contas({ db, usuario }) {
  const [contas, setContas] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Corrente');
  const [saldoInicial, setSaldoInicial] = useState('');

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    const lista = await db.getAllAsync('SELECT * FROM Contas WHERE id_usuario = ?;', [usuario.cd_usuario]);
    setContas(lista);
  };

  const salvar = async () => {
    if (!nome.trim()) {
      Alert.alert('Digite o nome da conta');
      return;
    }
    await db.runAsync(
      'INSERT INTO Contas (nm_conta, tp_conta, vl_conta_atual, id_usuario) VALUES (?, ?, ?, ?);',
      [nome.trim(), tipo, paraNumero(saldoInicial) || 0, usuario.cd_usuario]
    );
    setNome('');
    setSaldoInicial('');
    setMostrarForm(false);
    carregar();
  };

  const excluir = async (conta) => {
    await db.runAsync('DELETE FROM Transacoes WHERE id_conta = ?;', [conta.cd_conta]);
    await db.runAsync('DELETE FROM Contas WHERE cd_conta = ?;', [conta.cd_conta]);
    carregar();
  };

  const confirmarExcluir = (conta) => {
    Alert.alert('Excluir conta?', 'As movimentações dessa conta também serão apagadas.', [
      { text: 'Cancelar' },
      { text: 'Excluir', onPress: () => excluir(conta) },
    ]);
  };

  const saldoTotal = contas.reduce((total, conta) => total + conta.vl_conta_atual, 0);

  return (
    <View>
      <Botao texto={mostrarForm ? 'Cancelar' : 'Nova conta'} icone="add-circle-outline" onPress={() => setMostrarForm(!mostrarForm)} />

      {mostrarForm && (
        <View style={[estilos.painel, { marginTop: 14 }]}>
          <View style={estilos.campo}>
            <TextInput style={estilos.input} placeholder="Nome da conta" value={nome} onChangeText={setNome} />
          </View>
          <Text style={estilos.rotulo}>Tipo</Text>
          <View style={estilos.linhaChips}>
            {TIPOS_DE_CONTA.map((tipoConta) => (
              <Chip key={tipoConta} texto={tipoConta} ativo={tipo === tipoConta} onPress={() => setTipo(tipoConta)} />
            ))}
          </View>
          <View style={estilos.campo}>
            <Text style={{ color: VERDE, fontWeight: '700' }}>R$</Text>
            <TextInput style={estilos.input} placeholder="Saldo inicial" value={saldoInicial} onChangeText={setSaldoInicial} keyboardType="decimal-pad" />
          </View>
          <Botao texto="Salvar" onPress={salvar} />
        </View>
      )}

      <View style={[estilos.faixa, { marginTop: 14 }]}>
        <Text style={{ color: '#fff', fontSize: 15 }}>Saldo total das contas</Text>
        <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800' }}>{dinheiro(saldoTotal)}</Text>
      </View>

      {contas.map((conta) => (
        <View key={conta.cd_conta} style={estilos.contaItem}>
          <View style={estilos.iconeMov}>
            <Ionicons name="wallet" size={24} color={VERDE} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: VERDE_ESCURO }}>{conta.nm_conta}</Text>
            <Text style={{ fontSize: 12.5, color: '#6B7A6F' }}>{conta.tp_conta}</Text>
          </View>
          <Text style={{ fontSize: 17, fontWeight: '800', color: conta.vl_conta_atual < 0 ? '#9E4040' : VERDE_ESCURO }}>{dinheiro(conta.vl_conta_atual)}</Text>
          <TouchableOpacity onPress={() => confirmarExcluir(conta)} style={estilos.lixo}>
            <Ionicons name="trash-outline" size={20} color="#9E4040" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
