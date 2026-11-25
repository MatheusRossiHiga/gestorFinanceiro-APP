import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { VERDE_ESCURO } from "../styles/tema";
import { estilos } from "../styles/styles";
import { dinheiro, agora, dataBR, dataParaBanco } from "../dados";
import { Botao, Painel } from "../componentes";

const CORES = [
  "#328553",
  "#D4A72C",
  "#46B772",
  "#9E4040",
  "#857432",
  "#1F5233",
  "#6B7A6F",
];

function Grafico({ itens, total }) {
  if (itens.length === 0) {
    return (
      <View style={estilos.vazioGrafico}>
        <Text style={estilos.vazioTxt}>Nenhum valor neste período.</Text>
      </View>
    );
  }

  return (
    <View>
      {itens.map((item, posicao) => {
        const porcentagem = Math.round((item.total / total) * 100);
        const cor = CORES[posicao % CORES.length];
        return (
          <View key={item.nm_categoria} style={{ marginBottom: 12 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <Text style={{ color: VERDE_ESCURO, fontWeight: "600" }}>
                {item.nm_categoria}
              </Text>
              <Text style={{ color: VERDE_ESCURO }}>
                {dinheiro(item.total)} · {porcentagem}%
              </Text>
            </View>
            <View style={estilos.trilho}>
              <View
                style={{
                  width: porcentagem + "%",
                  height: "100%",
                  backgroundColor: cor,
                  borderRadius: 99,
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Cartao({ rotulo, valor, cor, destaque }) {
  return (
    <View
      style={[estilos.cartaoNumero, destaque && { backgroundColor: "#FAF3DC" }]}
    >
      <Text style={{ fontSize: 12, color: "#6E726C" }}>{rotulo}</Text>
      <Text style={{ fontSize: 18, fontWeight: "800", color: cor }}>
        {valor}
      </Text>
    </View>
  );
}

export default function Relatorios({ db, usuario }) {
  const [de, setDe] = useState("01/" + dataBR(agora()).slice(3));
  const [ate, setAte] = useState(dataBR(agora()));
  const [despesas, setDespesas] = useState([]);
  const [receitas, setReceitas] = useState([]);

  useEffect(() => {
    carregar();
  }, []);

  const buscarPorCategoria = async (tipo, dataInicial, dataFinal) => {
    return await db.getAllAsync(
      `SELECT Categorias.nm_categoria, SUM(Transacoes.vl_transacao) AS total FROM Transacoes
       JOIN Contas ON Contas.cd_conta = Transacoes.id_conta
       JOIN Categorias ON Categorias.cd_categoria = Transacoes.id_categoria
       WHERE Contas.id_usuario = ? AND tp_transacao = ? AND st_transacao = 'C'
       AND dt_transacao >= ? AND dt_transacao <= ?
       GROUP BY Categorias.cd_categoria
       ORDER BY total DESC;`,
      [
        usuario.cd_usuario,
        tipo,
        dataInicial + " 00:00:00",
        dataFinal + " 23:59:59",
      ]
    );
  };

  const carregar = async () => {
    const dataInicial = dataParaBanco(de);
    const dataFinal = dataParaBanco(ate);
    if (!dataInicial || !dataFinal) {
      Alert.alert("Data inválida", "Use o formato dd/mm/aaaa");
      return;
    }
    setDespesas(await buscarPorCategoria("S", dataInicial, dataFinal));
    setReceitas(await buscarPorCategoria("E", dataInicial, dataFinal));
  };

  const totalDespesas = despesas.reduce((soma, item) => soma + item.total, 0);
  const totalReceitas = receitas.reduce((soma, item) => soma + item.total, 0);
  const resultado = totalReceitas - totalDespesas;
  const taxaDePoupanca =
    totalReceitas > 0 ? Math.round((resultado / totalReceitas) * 100) : 0;

  return (
    <View>
      <Text style={{ color: "#6B7A6F", marginBottom: 14 }}>
        Entenda para onde seu dinheiro está indo.
      </Text>

      <Painel>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={estilos.rotulo}>De</Text>
            <View style={estilos.campo}>
              <TextInput
                style={estilos.input}
                value={de}
                onChangeText={setDe}
                placeholder="dd/mm/aaaa"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={estilos.rotulo}>Até</Text>
            <View style={estilos.campo}>
              <TextInput
                style={estilos.input}
                value={ate}
                onChangeText={setAte}
                placeholder="dd/mm/aaaa"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
        </View>
        <Botao texto="Aplicar período" onPress={carregar} escuro />
      </Painel>

      <View style={estilos.gradeNumeros}>
        <Cartao
          rotulo="Entradas no período"
          valor={dinheiro(totalReceitas)}
          cor="#2E8B57"
        />
        <Cartao
          rotulo="Saídas no período"
          valor={dinheiro(totalDespesas)}
          cor="#9E4040"
        />
        <Cartao
          rotulo="Resultado"
          valor={dinheiro(resultado)}
          cor={resultado < 0 ? "#9E4040" : "#2E8B57"}
        />
        <Cartao
          rotulo="Taxa de poupança"
          valor={taxaDePoupanca + "%"}
          cor="#857432"
          destaque
        />
      </View>

      <Painel titulo="Despesas por categoria">
        <Grafico itens={despesas} total={totalDespesas} />
      </Painel>

      <Painel titulo="Receitas por categoria">
        <Grafico itens={receitas} total={totalReceitas} />
      </Painel>
    </View>
  );
}
