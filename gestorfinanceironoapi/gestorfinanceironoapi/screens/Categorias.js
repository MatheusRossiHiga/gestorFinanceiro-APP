import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VERDE_ESCURO, VERDE } from "../styles/tema";
import { estilos } from "../styles/styles";
import { Botao } from "../componentes";

export default function Categorias({ db, usuario }) {
  const [categorias, setCategorias] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nome, setNome] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    const lista = await db.getAllAsync(
      "SELECT * FROM Categorias WHERE id_usuario = ?;",
      [usuario.cd_usuario]
    );
    setCategorias(lista);
  };

  const salvar = async () => {
    if (!nome.trim()) {
      Alert.alert("Digite o nome da categoria");
      return;
    }
    await db.runAsync(
      "INSERT INTO Categorias (nm_categoria, id_usuario) VALUES (?, ?);",
      [nome.trim(), usuario.cd_usuario]
    );
    setNome("");
    setMostrarForm(false);
    carregar();
  };

  const excluir = async (categoria) => {
    const emUso = await db.getFirstAsync(
      "SELECT COUNT(*) AS total FROM Transacoes WHERE id_categoria = ?;",
      [categoria.cd_categoria]
    );
    if (emUso.total > 0) {
      Alert.alert(
        "Essa categoria está em uso",
        "Exclua as movimentações dela antes."
      );
      return;
    }
    await db.runAsync("DELETE FROM Categorias WHERE cd_categoria = ?;", [
      categoria.cd_categoria,
    ]);
    carregar();
  };

  const confirmarExcluir = (categoria) => {
    Alert.alert("Excluir categoria?", categoria.nm_categoria, [
      { text: "Cancelar" },
      { text: "Excluir", onPress: () => excluir(categoria) },
    ]);
  };

  return (
    <View>
      <Botao
        texto={mostrarForm ? "Cancelar" : "Nova categoria"}
        icone="add-circle-outline"
        onPress={() => setMostrarForm(!mostrarForm)}
      />

      {mostrarForm && (
        <View style={[estilos.painel, { marginTop: 14 }]}>
          <View style={estilos.campo}>
            <TextInput
              style={estilos.input}
              placeholder="Nome da categoria"
              value={nome}
              onChangeText={setNome}
            />
          </View>
          <Botao texto="Salvar" onPress={salvar} />
        </View>
      )}

      <View style={{ height: 14 }} />

      {categorias.map((categoria) => (
        <View key={categoria.cd_categoria} style={estilos.contaItem}>
          <View style={estilos.iconeMov}>
            <Ionicons name="pricetag" size={24} color={VERDE} />
          </View>
          <Text
            style={{
              flex: 1,
              fontSize: 17,
              fontWeight: "800",
              color: VERDE_ESCURO,
            }}
          >
            {categoria.nm_categoria}
          </Text>
          <TouchableOpacity
            onPress={() => confirmarExcluir(categoria)}
            style={estilos.lixo}
          >
            <Ionicons name="trash-outline" size={20} color="#9E4040" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
