import React, { useState, useEffect } from "react";
import {View, Text, ScrollView, TouchableOpacity,  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as SQLite from "expo-sqlite";
import { VERDE_ESCURO, VERDE, VERDE_CLARO, FUNDO } from "./styles/tema";
import { estilos } from "./styles/styles";
import { Logo, TOPO } from "./componentes";

import Login from "./screens/Login";
import Inicio from "./screens/Inicio";
import Movimentos from "./screens/Movimentos";
import Contas from "./screens/Contas";
import Categorias from "./screens/Categorias";
import Metas from "./screens/Metas";
import EfeitoDomino from "./screens/EfeitoDomino";
import Relatorios from "./screens/Relatorios";

const ABAS = [
  { chave: "inicio", nome: "Geral", icone: "home", tela: Inicio },
  {
    chave: "movimentos",
    nome: "Movimentos",
    icone: "swap-vertical",
    tela: Movimentos,
  },
  { chave: "contas", nome: "Contas", icone: "wallet", tela: Contas },
  {
    chave: "categorias",
    nome: "Categorias",
    icone: "pricetag",
    tela: Categorias,
  },
  { chave: "metas", nome: "Metas", icone: "checkmark-circle", tela: Metas },
  {
    chave: "efeito",
    nome: "Efeito Dominó",
    tela: EfeitoDomino,
    escondida: true,
  },
  {
    chave: "relatorios",
    nome: "Relatórios",
    tela: Relatorios,
    escondida: true,
  },
];

function Principal({ db, usuario, sair }) {
  const [abaAtual, setAbaAtual] = useState("inicio");
  const aba = ABAS.find((item) => item.chave === abaAtual);
  const Tela = aba.tela;

  return (
    <View style={{ flex: 1, backgroundColor: FUNDO }}>
      <LinearGradient
        colors={[VERDE_ESCURO, VERDE, VERDE_CLARO]}
        start={{ x: 0, y: 0.1 }}
        end={{ x: 1, y: 0.9 }}
        style={[estilos.cabecalho, { paddingTop: TOPO + 10 }]}
      >
        <View style={{ width: 40 }} />
        {abaAtual === "inicio" ? (
          <Logo tamanho={34} />
        ) : (
          <Text style={estilos.cabTitulo}>{aba.nome}</Text>
        )}
        <TouchableOpacity style={estilos.avatar} onPress={sair}>
          <Text style={{ color: VERDE_ESCURO, fontWeight: "800" }}>
            {usuario.nm_usuario.charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 18, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <Tela db={db} usuario={usuario} irPara={setAbaAtual} />
      </ScrollView>

      <View style={estilos.barraPos}>
        <LinearGradient
          colors={[VERDE_ESCURO, VERDE, VERDE_CLARO]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={estilos.barra}
        >
          {ABAS.filter((item) => !item.escondida).map((item) => (
            <TouchableOpacity
              key={item.chave}
              onPress={() => setAbaAtual(item.chave)}
              style={[
                estilos.abaItem,
                item.chave === abaAtual && {
                  backgroundColor: "rgba(255,255,255,0.22)",
                },
              ]}
            >
              <Ionicons name={item.icone} size={19} color="#fff" />
              <Text style={estilos.abaTxt} numberOfLines={1}>
                {item.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </LinearGradient>
      </View>
    </View>
  );
}

export default function App() {
  const [db, setDb] = useState(null);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    (async () => {
      const database = await SQLite.openDatabaseAsync("livre.db");

      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS usuarios (
          cd_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
          nm_usuario TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          senha TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS Contas (
          cd_conta INTEGER PRIMARY KEY AUTOINCREMENT,
          nm_conta TEXT NOT NULL,
          tp_conta TEXT NOT NULL,
          vl_conta_atual REAL NOT NULL DEFAULT 0,
          id_usuario INTEGER NOT NULL,
          FOREIGN KEY (id_usuario) REFERENCES usuarios(cd_usuario)
        );
        CREATE TABLE IF NOT EXISTS Categorias (
          cd_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
          nm_categoria TEXT NOT NULL,
          id_usuario INTEGER NOT NULL,
          FOREIGN KEY (id_usuario) REFERENCES usuarios(cd_usuario)
        );
        CREATE TABLE IF NOT EXISTS Transacoes (
          cd_transacoes INTEGER PRIMARY KEY AUTOINCREMENT,
          ds_descricao TEXT NOT NULL,
          vl_transacao REAL NOT NULL,
          tp_transacao TEXT NOT NULL,
          dt_transacao TEXT NOT NULL,
          st_transacao TEXT NOT NULL DEFAULT 'C',
          id_conta INTEGER NOT NULL,
          id_categoria INTEGER NOT NULL,
          FOREIGN KEY (id_conta) REFERENCES Contas(cd_conta),
          FOREIGN KEY (id_categoria) REFERENCES Categorias(cd_categoria)
        );
        CREATE TABLE IF NOT EXISTS Metas (
          cd_meta INTEGER PRIMARY KEY AUTOINCREMENT,
          nm_meta TEXT NOT NULL,
          vl_objetivo REAL NOT NULL,
          vl_guardado REAL NOT NULL DEFAULT 0,
          dt_limite TEXT,
          id_usuario INTEGER NOT NULL,
          FOREIGN KEY (id_usuario) REFERENCES usuarios(cd_usuario)
        );
      `);

      setDb(database);
    })();
  }, []);

  if (!db) {
    return <View style={{ flex: 1, backgroundColor: VERDE_ESCURO }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      {usuario ? (
        <Principal db={db} usuario={usuario} sair={() => setUsuario(null)} />
      ) : (
        <Login db={db} entrar={setUsuario} />
      )}
    </View>
  );
}
