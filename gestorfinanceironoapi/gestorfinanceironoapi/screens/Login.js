import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { VERDE_ESCURO, VERDE_CLARO } from "../styles/tema";
import { estilos } from "../styles/styles";
import { Logo, Botao, TOPO } from "../componentes";

const CATEGORIAS_INICIAIS = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Lazer",
  "Salário",
  "Outros",
];

export default function Login({ db, entrar }) {
  const [cadastro, setCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const enviar = async () => {
    if (cadastro) {
      if (!nome.trim() || !email.trim() || !senha) {
        Alert.alert("Preencha todos os campos");
        return;
      }
      const usuarioExistente = await db.getFirstAsync(
        "SELECT * FROM usuarios WHERE email = ?;",
        [email.trim()]
      );
      if (usuarioExistente) {
        Alert.alert("Esse e-mail já está cadastrado");
        return;
      }
      const resultado = await db.runAsync(
        "INSERT INTO usuarios (nm_usuario, email, senha) VALUES (?, ?, ?);",
        [nome.trim(), email.trim(), senha]
      );
      const codigoUsuario = resultado.lastInsertRowId;
      await db.runAsync(
        "INSERT INTO Contas (nm_conta, tp_conta, vl_conta_atual, id_usuario) VALUES (?, ?, ?, ?);",
        ["Carteira", "Carteira", 0, codigoUsuario]
      );
      for (const categoria of CATEGORIAS_INICIAIS) {
        await db.runAsync(
          "INSERT INTO Categorias (nm_categoria, id_usuario) VALUES (?, ?);",
          [categoria, codigoUsuario]
        );
      }
      entrar({ cd_usuario: codigoUsuario, nm_usuario: nome.trim() });
    } else {
      const usuario = await db.getFirstAsync(
        "SELECT * FROM usuarios WHERE email = ? AND senha = ?;",
        [email.trim(), senha]
      );
      if (!usuario) {
        Alert.alert("E-mail ou senha incorretos");
        return;
      }
      entrar(usuario);
    }
  };

  return (
    <LinearGradient
      colors={[VERDE_ESCURO, "#2D7549", VERDE_CLARO]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: TOPO + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center" }}>
          <Logo tamanho={48} />
          <Text style={estilos.tagline}>
            Tenha controle sobre suas finanças e alcance suas metas
          </Text>
        </View>

        <View style={estilos.cartaoLogin}>
          <Text style={estilos.titulo}>
            {cadastro ? "Criar conta" : "Bem-Vindo de volta!"}
          </Text>
          <Text style={{ color: VERDE_ESCURO, marginBottom: 16 }}>
            {cadastro
              ? "Leva menos de um minuto"
              : "Faça login para acessar sua conta"}
          </Text>

          {cadastro && (
            <View style={estilos.campo}>
              <Ionicons name="person-outline" size={20} color={VERDE_ESCURO} />
              <TextInput
                style={estilos.input}
                placeholder="Nome"
                value={nome}
                onChangeText={setNome}
              />
            </View>
          )}
          <View style={estilos.campo}>
            <Ionicons name="mail-outline" size={20} color={VERDE_ESCURO} />
            <TextInput
              style={estilos.input}
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <View style={estilos.campo}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={VERDE_ESCURO}
            />
            <TextInput
              style={estilos.input}
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />
          </View>

          <Botao
            texto={cadastro ? "Criar conta" : "Entrar"}
            escuro
            onPress={enviar}
          />

          <TouchableOpacity
            onPress={() => setCadastro(!cadastro)}
            style={{ marginTop: 16, alignItems: "center" }}
          >
            <Text style={{ color: VERDE_ESCURO }}>
              {cadastro ? "Já tem conta? " : "Ainda não tem uma conta? "}
              <Text style={{ color: "#3C9E63", fontWeight: "700" }}>
                {cadastro ? "Entrar" : "Criar conta"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
