import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { VERDE_ESCURO, VERDE } from '../styles/tema';
import { estilos } from '../styles/styles';
import { dinheiro, paraNumero, dataBR, dataParaBanco } from '../dados';
import { Botao, Painel } from '../componentes';

export default function Metas({ db, usuario }) {
  const [metas, setMetas] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nome, setNome] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [prazo, setPrazo] = useState('');
  const [valores, setValores] = useState({});

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    const lista = await db.getAllAsync('SELECT * FROM Metas WHERE id_usuario = ?;', [usuario.cd_usuario]);
    setMetas(lista);
  };

  const salvar = async () => {
    const valorObjetivo = paraNumero(objetivo);
    if (!nome.trim() || !valorObjetivo || valorObjetivo <= 0) {
      Alert.alert('Preencha o nome e o valor da meta');
      return;
    }
    let dataLimite = null;
    if (prazo.trim()) {
      dataLimite = dataParaBanco(prazo.trim());
      if (!dataLimite) {
        Alert.alert('Prazo inválido', 'Use o formato dd/mm/aaaa');
        return;
      }
    }
    await db.runAsync(
      'INSERT INTO Metas (nm_meta, vl_objetivo, vl_guardado, dt_limite, id_usuario) VALUES (?, ?, 0, ?, ?);',
      [nome.trim(), valorObjetivo, dataLimite, usuario.cd_usuario]
    );
    setNome('');
    setObjetivo('');
    setPrazo('');
    setMostrarForm(false);
    carregar();
  };

  const guardarOuRetirar = async (meta, sinal) => {
    const valorDigitado = paraNumero(valores[meta.cd_meta] || '');
    if (!valorDigitado || valorDigitado <= 0) {
      Alert.alert('Digite um valor');
      return;
    }
    const novoValor = Math.round((meta.vl_guardado + sinal * valorDigitado) * 100) / 100;
    if (novoValor < 0) {
      Alert.alert('Não dá para retirar mais do que foi guardado');
      return;
    }
    await db.runAsync('UPDATE Metas SET vl_guardado = ? WHERE cd_meta = ?;', [novoValor, meta.cd_meta]);
    setValores({ ...valores, [meta.cd_meta]: '' });
    carregar();
  };

  const excluir = async (meta) => {
    await db.runAsync('DELETE FROM Metas WHERE cd_meta = ?;', [meta.cd_meta]);
    carregar();
  };

  const confirmarExcluir = (meta) => {
    Alert.alert('Excluir meta?', meta.nm_meta, [
      { text: 'Cancelar' },
      { text: 'Excluir', onPress: () => excluir(meta) },
    ]);
  };

  const totalGuardado = metas.reduce((total, meta) => total + meta.vl_guardado, 0);

  return (
    <View>
      <Botao texto={mostrarForm ? 'Cancelar' : 'Nova meta'} icone="add-circle-outline" onPress={() => setMostrarForm(!mostrarForm)} />

      {mostrarForm && (
        <View style={[estilos.painel, { marginTop: 14 }]}>
          <View style={estilos.campo}>
            <TextInput style={estilos.input} placeholder="Nome da meta" value={nome} onChangeText={setNome} />
          </View>
          <View style={estilos.campo}>
            <Text style={{ color: VERDE, fontWeight: '700' }}>R$</Text>
            <TextInput style={estilos.input} placeholder="Valor do objetivo" value={objetivo} onChangeText={setObjetivo} keyboardType="decimal-pad" />
          </View>
          <View style={estilos.campo}>
            <TextInput style={estilos.input} placeholder="Prazo (dd/mm/aaaa) - opcional" value={prazo} onChangeText={setPrazo} keyboardType="numbers-and-punctuation" />
          </View>
          <Botao texto="Salvar" onPress={salvar} />
        </View>
      )}

      <View style={[estilos.faixa, { marginTop: 14 }]}>
        <Text style={{ color: '#fff', fontSize: 15 }}>Reservado em metas</Text>
        <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800' }}>{dinheiro(totalGuardado)}</Text>
      </View>

      {metas.length === 0 && (
        <Painel>
          <Text style={estilos.vazioTitulo}>Nenhuma meta ainda</Text>
        </Painel>
      )}

      {metas.map((meta) => {
        const porcentagem = Math.min(100, Math.round((meta.vl_guardado / meta.vl_objetivo) * 100));
        return (
          <Painel key={meta.cd_meta}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ flex: 1, fontSize: 18, fontWeight: '800', color: VERDE_ESCURO }}>{meta.nm_meta}</Text>
              <TouchableOpacity onPress={() => confirmarExcluir(meta)} style={estilos.lixo}>
                <Text style={{ color: '#9E4040' }}>Excluir</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 26, fontWeight: '800', color: VERDE_ESCURO, marginVertical: 6 }}>
              {dinheiro(meta.vl_guardado)} <Text style={{ fontSize: 14, fontWeight: '500', color: '#6B7A6F' }}>de {dinheiro(meta.vl_objetivo)}</Text>
            </Text>
            <View style={estilos.trilho}>
              <View style={{ width: porcentagem + '%', height: '100%', backgroundColor: VERDE, borderRadius: 99 }} />
            </View>
            <Text style={{ color: '#6B7A6F', marginTop: 8 }}>
              {porcentagem}% concluído{meta.dt_limite ? ' · prazo ' + dataBR(meta.dt_limite) : ''}
            </Text>

            <View style={estilos.acoes}>
              <View style={[estilos.campo, { flex: 1, marginBottom: 0, minHeight: 44 }]}>
                <TextInput
                  style={estilos.input}
                  placeholder="Valor"
                  value={valores[meta.cd_meta] || ''}
                  onChangeText={(texto) => setValores({ ...valores, [meta.cd_meta]: texto })}
                  keyboardType="decimal-pad"
                />
              </View>
              <TouchableOpacity style={[estilos.botaoPequeno, { marginLeft: 8 }]} onPress={() => guardarOuRetirar(meta, 1)}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[estilos.botaoPequeno, { marginLeft: 6, backgroundColor: VERDE_ESCURO }]} onPress={() => guardarOuRetirar(meta, -1)}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Retirar</Text>
              </TouchableOpacity>
            </View>
          </Painel>
        );
      })}
    </View>
  );
}
