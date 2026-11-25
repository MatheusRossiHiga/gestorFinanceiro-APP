import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VERDE } from "../styles/tema";
import { estilos } from "../styles/styles";
import { dinheiro, mesAtual, saudacao, dataExtenso } from "../dados";
import { Botao, Painel, Pilula, LinhaTransacao } from "../componentes";

export default function Inicio({ db, usuario, irPara }) {
  const [saldo, setSaldo] = useState(0);
  const [comprometido, setComprometido] = useState(0);
  const [guardado, setGuardado] = useState(0);
  const [entradasDoMes, setEntradasDoMes] = useState(0);
  const [saidasDoMes, setSaidasDoMes] = useState(0);
  const [recentes, setRecentes] = useState([]);

  useEffect(() => {
    carregar();
  }, []);

  const somarTransacoes = async (tipo, status, mes) => {
    const resultado = await db.getFirstAsync(
      `SELECT SUM(vl_transacao) AS total FROM Transacoes
       JOIN Contas ON Contas.cd_conta = Transacoes.id_conta
       WHERE Contas.id_usuario = ? AND tp_transacao = ? AND st_transacao = ? AND dt_transacao LIKE ?;`,
      [usuario.cd_usuario, tipo, status, mes]
    );
    return resultado.total || 0;
  };

  const carregar = async () => {
    const mes = mesAtual() + "%";

    const contas = await db.getFirstAsync(
      "SELECT SUM(vl_conta_atual) AS total FROM Contas WHERE id_usuario = ?;",
      [usuario.cd_usuario]
    );
    const metas = await db.getFirstAsync(
      "SELECT SUM(vl_guardado) AS total FROM Metas WHERE id_usuario = ?;",
      [usuario.cd_usuario]
    );
    const ultimas = await db.getAllAsync(
      `SELECT Transacoes.*, Categorias.nm_categoria FROM Transacoes
       JOIN Contas ON Contas.cd_conta = Transacoes.id_conta
       JOIN Categorias ON Categorias.cd_categoria = Transacoes.id_categoria
       WHERE Contas.id_usuario = ?
       ORDER BY dt_transacao DESC, cd_transacoes DESC LIMIT 5;`,
      [usuario.cd_usuario]
    );

    setSaldo(contas.total || 0);
    setGuardado(metas.total || 0);
    setComprometido(await somarTransacoes("S", "P", "%"));
    setEntradasDoMes(await somarTransacoes("E", "C", mes));
    setSaidasDoMes(await somarTransacoes("S", "C", mes));
    setRecentes(ultimas);
  };

  const livre = saldo - comprometido - guardado;

  return (
    <View>
      <Text style={estilos.saudacao}>
        {saudacao()}, {usuario.nm_usuario}!
      </Text>
      <Text style={estilos.data}>{dataExtenso()}</Text>

      <View style={{ marginVertical: 16 }}>
        <Botao
          texto="Nova movimentação"
          icone="add-circle-outline"
          onPress={() => irPara("movimentos")}
        />
      </View>

      <View style={estilos.saldoCard}>
        <Text style={{ color: "#fff", fontSize: 17 }}>
          Saldo atual nas contas
        </Text>
        <Text style={estilos.saldoValor}>{dinheiro(saldo)}</Text>
        <View style={estilos.linhaFina} />
        <View style={{ flexDirection: "row" }}>
          <View style={estilos.col}>
            <Text style={estilos.colRotulo}>Comprometido</Text>
            <Text style={estilos.colValor}>-{dinheiro(comprometido)}</Text>
          </View>
          <View style={estilos.col}>
            <Text style={estilos.colRotulo}>Metas</Text>
            <Text style={estilos.colValor}>-{dinheiro(guardado)}</Text>
          </View>
          <View style={estilos.col}>
            <Text style={estilos.colRotulo}>Livre</Text>
            <Text style={[estilos.colValor, { color: "#F4E9A8" }]}>
              {dinheiro(livre)}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        <Pilula
          rotulo="Entradas do mês"
          valor={dinheiro(entradasDoMes)}
          cor="#2E8B57"
        />
        <Pilula
          rotulo="Saídas do mês"
          valor={dinheiro(saidasDoMes)}
          cor="#9E4040"
        />
        <Pilula rotulo="Saldo livre" valor={dinheiro(livre)} cor="#857432" />
      </View>

      <Painel titulo="Atividades Recentes">
        {recentes.length === 0 ? (
          <Text style={estilos.vazioTxt}>Nenhuma movimentação ainda</Text>
        ) : (
          recentes.map((transacao) => (
            <LinhaTransacao
              key={transacao.cd_transacoes}
              transacao={transacao}
            />
          ))
        )}
      </Painel>

      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          style={estilos.atalho}
          onPress={() => irPara("relatorios")}
        >
          <Ionicons name="bar-chart" size={22} color={VERDE} />
          <Text style={estilos.atalhoTxt}>Relatórios</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[estilos.atalho, { marginLeft: 10 }]}
          onPress={() => irPara("efeito")}
        >
          <Ionicons name="layers" size={22} color={VERDE} />
          <Text style={estilos.atalhoTxt}>Efeito Dominó</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
