import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api/v1';
const tripId = process.env.EXPO_PUBLIC_TRIP_ID ?? '';
const today = new Date().toISOString().slice(0, 10);

async function request(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  const payload = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(payload?.error?.message ?? 'Não foi possível comunicar com a API.');
  return payload?.data;
}

const money = (value, currency = 'BRL') => new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value));

export default function App() {
  const [dashboard, setDashboard] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ descricao: '', valor: '', categoriaId: '', dataDespesa: today });

  const load = useCallback(async () => {
    if (!tripId) { Alert.alert('Configuração necessária', 'Defina EXPO_PUBLIC_TRIP_ID no arquivo .env.'); setLoading(false); return; }
    try {
      const [budget, categoryList, dashboardData] = await Promise.all([
        request(`/trips/${tripId}/budget`), request('/categories'), request(`/trips/${tripId}/dashboard`),
      ]);
      const expenseResult = await request(`/budgets/${budget.id}/expenses?limit=100`);
      setDashboard(dashboardData);
      setCategories(categoryList);
      setExpenses(expenseResult.data);
      setForm((current) => ({ ...current, categoriaId: current.categoriaId || categoryList[0]?.id || '' }));
    } catch (error) { Alert.alert('Falha ao carregar', error.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  const currency = dashboard?.moeda ?? 'BRL';
  const categoryName = useMemo(() => new Map(categories.map((category) => [category.id, category.nome])), [categories]);

  async function saveExpense() {
    const value = Number(form.valor.replace(',', '.'));
    if (!form.descricao.trim() || !form.categoriaId || !Number.isFinite(value) || value <= 0) {
      Alert.alert('Dados inválidos', 'Informe descrição, categoria e valor positivo.'); return;
    }
    try {
      const budget = await request(`/trips/${tripId}/budget`);
      await request(`/budgets/${budget.id}/expenses`, { method: 'POST', body: JSON.stringify({ ...form, descricao: form.descricao.trim(), valor: value }) });
      setModalVisible(false);
      setForm({ descricao: '', valor: '', categoriaId: categories[0]?.id ?? '', dataDespesa: today });
      setLoading(true);
      await load();
    } catch (error) { Alert.alert('Não foi possível salvar', error.message); }
  }

  async function removeExpense(expense) {
    Alert.alert('Excluir despesa', `Excluir “${expense.descricao}”?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => { try { await request(`/expenses/${expense.id}`, { method: 'DELETE' }); setLoading(true); await load(); } catch (error) { Alert.alert('Erro', error.message); } } },
    ]);
  }

  if (loading && !dashboard) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#0F766E" /><Text style={styles.muted}>Carregando viagem…</Text></SafeAreaView>;
  return <SafeAreaView style={styles.screen}><StatusBar style="dark" />
    <FlatList data={expenses} keyExtractor={(item) => item.id} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { setLoading(true); load(); }} />}
      ListHeaderComponent={<><Text style={styles.title}>TravelLookAI</Text><Text style={styles.subtitle}>Controle de gastos da viagem</Text>
        <View style={styles.summary}><Text style={styles.summaryLabel}>Saldo disponível</Text><Text style={styles.balance}>{money(dashboard?.saldoDisponivel ?? 0, currency)}</Text><Text style={styles.detail}>{money(dashboard?.valorGasto ?? 0, currency)} de {money(dashboard?.valorPlanejado ?? 0, currency)} · {dashboard?.percentualUtilizado ?? 0}%</Text></View>
        <Text style={styles.section}>Por categoria</Text><View style={styles.categoryGrid}>{(dashboard?.categorias ?? []).filter((item) => Number(item.valorGasto) > 0).map((item) => <View key={item.categoriaId} style={styles.category}><Text style={styles.categoryName}>{item.categoriaNome}</Text><Text>{money(item.valorGasto, currency)}</Text></View>)}</View>
        <Text style={styles.section}>Despesas recentes</Text></>}
      renderItem={({ item }) => <Pressable style={styles.expense} onLongPress={() => removeExpense(item)}><View><Text style={styles.expenseName}>{item.descricao}</Text><Text style={styles.muted}>{item.categoriaNome} · {item.dataDespesa}</Text></View><Text style={styles.expenseValue}>{money(item.valor, currency)}</Text></Pressable>}
      ListEmptyComponent={<Text style={styles.empty}>Nenhuma despesa registrada.</Text>} contentContainerStyle={styles.list} />
    <Pressable style={styles.fab} onPress={() => setModalVisible(true)}><Text style={styles.fabText}>+ Adicionar</Text></Pressable>
    <Modal visible={modalVisible} animationType="slide" transparent><View style={styles.overlay}><View style={styles.modal}><Text style={styles.modalTitle}>Nova despesa</Text>
      <TextInput style={styles.input} placeholder="Descrição" value={form.descricao} onChangeText={(descricao) => setForm({ ...form, descricao })} />
      <TextInput style={styles.input} placeholder="Valor" keyboardType="decimal-pad" value={form.valor} onChangeText={(valor) => setForm({ ...form, valor })} />
      <TextInput style={styles.input} placeholder="AAAA-MM-DD" value={form.dataDespesa} onChangeText={(dataDespesa) => setForm({ ...form, dataDespesa })} />
      <View style={styles.categoryChoices}>{categories.map((category) => <Pressable key={category.id} onPress={() => setForm({ ...form, categoriaId: category.id })} style={[styles.choice, form.categoriaId === category.id && styles.choiceSelected]}><Text>{categoryName.get(category.id)}</Text></Pressable>)}</View>
      <View style={styles.actions}><Pressable onPress={() => setModalVisible(false)}><Text style={styles.cancel}>Cancelar</Text></Pressable><Pressable style={styles.save} onPress={saveExpense}><Text style={styles.saveText}>Salvar</Text></Pressable></View>
    </View></View></Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#F8FAFC' }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }, list: { padding: 20, paddingBottom: 100 }, title: { fontSize: 30, fontWeight: '800', color: '#0F172A' }, subtitle: { color: '#64748B', marginTop: 3 }, summary: { backgroundColor: '#0F766E', padding: 20, borderRadius: 18, marginTop: 20 }, summaryLabel: { color: '#CCFBF1' }, balance: { color: 'white', fontSize: 27, fontWeight: '800', marginVertical: 6 }, detail: { color: '#CCFBF1' }, section: { fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 10, color: '#0F172A' }, categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, category: { backgroundColor: 'white', borderRadius: 10, padding: 10, minWidth: '46%' }, categoryName: { color: '#64748B', marginBottom: 3 }, expense: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, expenseName: { fontWeight: '700', color: '#0F172A' }, expenseValue: { fontWeight: '800', color: '#0F766E' }, muted: { color: '#64748B', marginTop: 3 }, empty: { color: '#64748B', textAlign: 'center', marginTop: 20 }, fab: { position: 'absolute', right: 20, bottom: 25, backgroundColor: '#0F766E', borderRadius: 24, paddingVertical: 14, paddingHorizontal: 20 }, fabText: { color: 'white', fontWeight: '800' }, overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000055' }, modal: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }, modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 16 }, input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, marginBottom: 10 }, categoryChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 }, choice: { borderWidth: 1, borderColor: '#CBD5E1', padding: 9, borderRadius: 20 }, choiceSelected: { backgroundColor: '#CCFBF1', borderColor: '#0F766E' }, actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20, alignItems: 'center' }, cancel: { color: '#475569', fontWeight: '700' }, save: { backgroundColor: '#0F766E', borderRadius: 9, paddingVertical: 12, paddingHorizontal: 18 }, saveText: { color: 'white', fontWeight: '800' } });
