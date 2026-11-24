import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { VERDE_ESCURO, VERDE, VERDE_CLARO, FUNDO } from './styles/tema';
import { estilos } from './styles/styles';
import { dinheiro, dataBR } from './dados';

export const TOPO = Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24);

export function Logo({ tamanho = 36 }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Ionicons name="leaf-outline" size={tamanho} color={FUNDO} />
      <Text style={{ color: FUNDO, fontSize: tamanho, fontWeight: '800', marginLeft: 4 }}>Livre</Text>
    </View>
  );
}

export function Botao({ texto, onPress, escuro, icone }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      {escuro ? (
        <View style={[estilos.botao, { backgroundColor: VERDE_ESCURO }]}>
          <Text style={estilos.botaoTxt}>{texto}</Text>
        </View>
      ) : (
        <LinearGradient colors={[VERDE, VERDE_CLARO]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={estilos.botao}>
          {icone ? <Ionicons name={icone} size={20} color="#fff" style={{ marginRight: 8 }} /> : null}
          <Text style={estilos.botaoTxt}>{texto}</Text>
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
}

export function Painel({ titulo, children }) {
  return (
    <View style={estilos.painel}>
      {titulo ? <Text style={estilos.painelTitulo}>{titulo}</Text> : null}
      {children}
    </View>
  );
}

export function Pilula({ rotulo, valor, cor }) {
  return (
    <View style={estilos.pilula}>
      <Text style={{ fontSize: 10, color: '#6E726C' }} numberOfLines={1}>{rotulo}</Text>
      <Text style={{ fontSize: 13, fontWeight: '800', color: cor }} numberOfLines={1}>{valor}</Text>
    </View>
  );
}

export function LinhaTransacao({ transacao, aoExcluir, aoConcluir }) {
  const entrada = transacao.tp_transacao === 'E';
  const pendente = transacao.st_transacao === 'P';
  return (
    <View style={estilos.linhaMov}>
      <View style={estilos.iconeMov}>
        <Ionicons name={entrada ? 'trending-up' : 'trending-down'} size={24} color={VERDE} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 17, color: '#6E726C' }}>{transacao.ds_descricao}</Text>
        <Text style={{ fontSize: 12, color: '#8C948D' }}>
          {dataBR(transacao.dt_transacao)} · {transacao.nm_categoria}{pendente ? ' · pendente' : ''}
        </Text>
      </View>
      <Text style={{ fontSize: 16, fontWeight: '600', color: entrada ? '#2E8B57' : '#9E4040' }}>
        {entrada ? '+ ' : '- '}{dinheiro(transacao.vl_transacao)}
      </Text>
      {aoConcluir && pendente ? (
        <TouchableOpacity onPress={aoConcluir} style={estilos.lixo}>
          <Ionicons name="checkmark-circle-outline" size={22} color={VERDE} />
        </TouchableOpacity>
      ) : null}
      {aoExcluir ? (
        <TouchableOpacity onPress={aoExcluir} style={estilos.lixo}>
          <Ionicons name="trash-outline" size={20} color="#9E4040" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function Chip({ texto, ativo, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[estilos.chip, ativo && { backgroundColor: VERDE_ESCURO, borderColor: VERDE_ESCURO }]}>
      <Text style={{ color: ativo ? '#fff' : VERDE_ESCURO, fontWeight: '600' }}>{texto}</Text>
    </TouchableOpacity>
  );
}
