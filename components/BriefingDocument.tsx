import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: "#F9F9F9" },
  section: { margin: 10, padding: 10 },
  title: { fontSize: 24, marginBottom: 20, color: "#1C1C1E", fontWeight: "bold" },
  query: { fontSize: 12, color: "#666", marginBottom: 10 },
  body: { fontSize: 14, lineHeight: 1.6 },
});

export const BriefingDocument = ({ query, analysis }: { query: string; analysis: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Intelligence Briefing</Text>
        <Text style={styles.query}>Target Query: {query}</Text>
        <View style={{ borderBottom: 2, borderColor: "#FFD60A", marginBottom: 20 }} />
        <Text style={styles.body}>{analysis}</Text>
      </View>
    </Page>
  </Document>
);
