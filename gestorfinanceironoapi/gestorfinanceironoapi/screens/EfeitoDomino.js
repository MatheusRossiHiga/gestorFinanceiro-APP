import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { VERDE_ESCURO, VERDE } from "../styles/tema";
import { estilos } from "../styles/styles";
import { dinheiro, paraNumero } from "../dados";
import { Botao, Painel } from "../componentes";

export default function EfeitoDomino({ db, usuario }) {
  const [saldo, setSaldo] = useState(0);
  const [comprometido, setComprometido] = useState(0);
  const [guardado, setGuardado] = useState(0);
  const [produto, setProduto] = useState("");
  const [valor, setValor] = useState("");
  const [parcelas, setParcelas] = useState("1");
  const [simulacao, setSimulacao] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    const contas = await db.getFirstAsync(
      "SELECT SUM(vl_conta_atual) AS total FROM Contas WHERE id_usuario = ?;",
      [usuario.cd_usuario]
    );
    const metas = await db.getFirstAsync(
      "SELECT SUM(vl_guardado) AS total FROM Metas WHERE id_usuario = ?;",
      [usuario.cd_usuario]
    );
    const pendentes = await db.getFirstAsync(
      `SELECT SUM(vl_transacao) AS total FROM Transacoes
       JOIN Contas ON Contas.cd_conta = Transacoes.id_conta
       WHERE Contas.id_usuario = ? AND tp_transacao = 'S' AND st_transacao = 'P';`,
      [usuario.cd_usuario]
    );
    setSaldo(contas.total || 0);
    setGuardado(metas.total || 0);
    setComprometido(pendentes.total || 0);
  };

  const simular = () => {
    const valorTotal = paraNumero(valor);
    const quantidade = Math.floor(paraNumero(parcelas));
    if (!produto.trim() || !valorTotal || valorTotal <= 0) {
      Alert.alert("Preencha o produto e o valor");
      return;
    }
    if (!quantidade || quantidade < 1) {
      Alert.alert("Parcelas deve ser 1 ou mais");
      return;
    }

    const valorParcela = Math.round((valorTotal / quantidade) * 100) / 100;
    const saldoDepois = saldo - valorParcela;
    const comprometidoDepois = comprometido + (valorTotal - valorParcela);
    const livreDepois = saldoDepois - comprometidoDepois - guardado;

    setSimulacao({
      produto: produto.trim(),
      valorTotal,
      quantidade,
      valorParcela,
      saldoDepois,
      comprometidoDepois,
      livreDepois,
    });
  };

  const livre = saldo - comprometido - guardado;

  let mensagem = "";
  let corMensagem = "#E3F2E8";
  if (simulacao) {
    if (simulacao.livreDepois >= 0) {
      mensagem =
        "A compra cabe no seu dinheiro livre sem comprometer contas nem metas.";
    } else if (simulacao.saldoDepois >= 0) {
      mensagem =
        "Cabe no saldo, mas compromete contas a pagar ou metas. Seu dinheiro livre ficaria negativo em " +
        dinheiro(-simulacao.livreDepois) +
        ".";
      corMensagem = "#FAF3DC";
    } else {
      mensagem =
        "Não cabe: seu saldo ficaria negativo em " +
        dinheiro(-simulacao.saldoDepois) +
        ".";
      corMensagem = "#F6DEDE";
    }
  }

  return (
    <View>
      <Text style={{ color: "#6B7A6F", marginBottom: 14 }}>
        Veja o que uma compra faz com seu dinheiro antes de fazê-la. Nada é
        registrado.
      </Text>

      <View style={estilos.faixa}>
        <Text style={{ color: "#fff", fontSize: 15 }}>
          Seu dinheiro livre hoje
        </Text>
        <Text style={{ color: "#F4E9A8", fontSize: 32, fontWeight: "800" }}>
          {dinheiro(livre)}
        </Text>
      </View>

      <Painel>
        <Text style={estilos.rotulo}>O que você quer comprar?</Text>
        <View style={estilos.campo}>
          <TextInput
            style={estilos.input}
            placeholder="Ex.: notebook"
            value={produto}
            onChangeText={setProduto}
          />
        </View>

        <Text style={estilos.rotulo}>Valor total</Text>
        <View style={estilos.campo}>
          <Text style={{ color: VERDE, fontWeight: "700" }}>R$</Text>
          <TextInput
            style={estilos.input}
            placeholder="0,00"
            value={valor}
            onChangeText={setValor}
            keyboardType="decimal-pad"
          />
        </View>

        <Text style={estilos.rotulo}>Parcelas</Text>
        <View style={[estilos.campo, { marginBottom: 4 }]}>
          <TextInput
            style={estilos.input}
            value={parcelas}
            onChangeText={setParcelas}
            keyboardType="number-pad"
          />
        </View>
        <Text style={{ color: "#6B7A6F", fontSize: 12, marginBottom: 14 }}>
          1 = à vista.
        </Text>

        <Botao texto="Simular" onPress={simular} escuro />
      </Painel>

      {simulacao && (
        <Painel>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                flex: 1,
                fontSize: 18,
                fontWeight: "800",
                color: VERDE_ESCURO,
              }}
            >
              {simulacao.produto}
            </Text>
            <View
              style={{
                backgroundColor: "#FAF3DC",
                borderRadius: 99,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{ color: "#857432", fontWeight: "700", fontSize: 12 }}
              >
                Projeção
              </Text>
            </View>
          </View>
          <Text style={{ color: "#6B7A6F", marginVertical: 8 }}>
            {simulacao.quantidade === 1
              ? "À vista: " + dinheiro(simulacao.valorTotal) + "."
              : simulacao.quantidade +
                "x de " +
                dinheiro(simulacao.valorParcela) +
                " (total " +
                dinheiro(simulacao.valorTotal) +
                ")."}
          </Text>

          <View
            style={{
              backgroundColor: corMensagem,
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: VERDE_ESCURO }}>{mensagem}</Text>
          </View>

          <View style={estilos.tabelaLinha}>
            <Text style={[estilos.tabelaRotulo, { fontWeight: "700" }]} />
            <Text style={[estilos.tabelaValor, { color: "#6B7A6F" }]}>
              Hoje
            </Text>
            <Text style={[estilos.tabelaValor, { color: "#6B7A6F" }]}>
              Após a compra
            </Text>
          </View>
          <View style={estilos.tabelaLinha}>
            <Text style={estilos.tabelaRotulo}>Saldo nas contas</Text>
            <Text style={estilos.tabelaValor}>{dinheiro(saldo)}</Text>
            <Text style={estilos.tabelaValor}>
              {dinheiro(simulacao.saldoDepois)}
            </Text>
          </View>
          <View style={estilos.tabelaLinha}>
            <Text style={estilos.tabelaRotulo}>Contas a pagar</Text>
            <Text style={estilos.tabelaValor}>{dinheiro(comprometido)}</Text>
            <Text style={estilos.tabelaValor}>
              {dinheiro(simulacao.comprometidoDepois)}
            </Text>
          </View>
          <View style={estilos.tabelaLinha}>
            <Text style={estilos.tabelaRotulo}>Guardado em metas</Text>
            <Text style={estilos.tabelaValor}>{dinheiro(guardado)}</Text>
            <Text style={estilos.tabelaValor}>{dinheiro(guardado)}</Text>
          </View>
          <View
            style={[
              estilos.tabelaLinha,
              { backgroundColor: "#FAF3DC", borderRadius: 10 },
            ]}
          >
            <Text style={[estilos.tabelaRotulo, { fontWeight: "800" }]}>
              Dinheiro livre
            </Text>
            <Text style={[estilos.tabelaValor, { fontWeight: "800" }]}>
              {dinheiro(livre)}
            </Text>
            <Text
              style={[
                estilos.tabelaValor,
                {
                  fontWeight: "800",
                  color: simulacao.livreDepois < 0 ? "#9E4040" : VERDE_ESCURO,
                },
              ]}
            >
              {dinheiro(simulacao.livreDepois)}
            </Text>
          </View>
        </Painel>
      )}
    </View>
  );
}
