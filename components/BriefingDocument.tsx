import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: "#F9F9F9", color: "#1C1C1E" },
  header: { marginBottom: 25, borderBottom: 3, borderColor: "#FFD60A", paddingBottom: 10 },
  brand: { fontSize: 10, fontWeight: "bold", color: "#1C1C1E", letterSpacing: 1, marginBottom: 5 },
  title: { fontSize: 24, fontWeight: "bold" },
  query: { fontSize: 11, color: "#666", marginTop: 4 },
  
  agentBox: { marginBottom: 20, padding: 15, backgroundColor: "#FFFFFF", borderRadius: 4, borderLeft: 4, borderColor: "#1C1C1E" },
  agentHeader: { display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  agentName: { fontSize: 14, fontWeight: "bold", color: "#1C1C1E" },
  agentId: { fontSize: 10, color: "#FFD60A", backgroundColor: "#1C1C1E", padding: "2 6" },
  
  bodyText: { fontSize: 10, lineHeight: 1.6, color: "#333" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, textAlign: "center", color: "#AAA", borderTop: 1, borderColor: "#EEE", paddingTop: 10 }
});

export const BriefingDocument = ({ query, analysis }: { query: string, analysis: string }) => {
  // Split the analysis string back into sections based on the ## delimiter
  const sections = analysis.split("## ").filter(s => s.trim() !== "");

  return (
    <Document title={`Intelligence Briefing - ${query}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>AI AUTOMATION MUM // INTELLIGENCE</Text>
          <Text style={styles.title}>Intelligence Briefing</Text>
          <Text style={styles.query}>Target: {query.toUpperCase()}</Text>
        </View>

        {sections.map((section, index) => {
          const [name, ...content] = section.split("\n");
          return (
            <View key={index} style={styles.agentBox} wrap={false}>
              <View style={styles.agentHeader}>
                <Text style={styles.agentName}>{name.toUpperCase()}</Text>
                <Text style={styles.agentId}>AGENT 0{index + 1}</Text>
              </View>
              <Text style={styles.bodyText}>{content.join("\n").trim()}</Text>
            </View>
          );
        })}

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `Confidential Analysis // ${query} // Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};
