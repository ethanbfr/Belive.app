case "parrainage":
  return (
    <div className="fade" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* HEADER LARGE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <h2 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 32, color: R, letterSpacing: 1 }}>
          PROGRAMME AMBASSADEUR
        </h2>
        <Pill color="purple">ACTIF</Pill>
      </div>

      {/* STATS LARGES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, width: '100%' }}>
        <SC label="Tes parrainages" value={parrainages?.length || 0} icon="👥" color="blue" />
        <SC label="Récompenses cumulées" value={((parrainages?.filter(r => r.usedBy)?.length || 0) * 10) + "€"} icon="💰" color="green" />
      </div>

      {/* SECTION CODE PERSO */}
      <Card style={{ width: '100%' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: M, marginBottom: 15, textTransform: "uppercase" }}>Ton Code de Parrainage Personnel</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: `1px dashed ${B}`, padding: '16px', borderRadius: 12, fontFamily: 'monospace', fontSize: 20, fontWeight: '700', textAlign: 'center', color: BL, letterSpacing: 2 }}>
            {monCodeParrain}
          </div>
          <Btn onClick={() => { navigator.clipboard.writeText(monCodeParrain); setParrainCopied(true); setTimeout(() => setParrainCopied(false), 2000); }}>
            {parrainCopied ? "Copié !" : "Copier le code"}
          </Btn>
        </div>
        <p style={{ marginTop: 15, fontSize: 13, color: M, lineHeight: 1.5 }}>
          Partage ce code à tes amis streamers. S'ils rejoignent l'Academy, tu gagnes **-50% sur ton prochain mois** et ils reçoivent un bonus de bienvenue.
        </p>
      </Card>

      {/* TABLEAU DES FILLEULS */}
      <Card style={{ width: '100%', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: `1px solid ${B}`, fontWeight: 700, fontSize: 14 }}>Historique des invitations</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
              <tr>
                <th style={{ padding: '15px 20px', textAlign: 'left', color: M, fontSize: 11 }}>NOM DU FILLEUL</th>
                <th style={{ padding: '15px 20px', textAlign: 'left', color: M, fontSize: 11 }}>DATE</th>
                <th style={{ padding: '15px 20px', textAlign: 'right', color: M, fontSize: 11 }}>STATUT</th>
              </tr>
            </thead>
            <tbody>
              {parrainages.length === 0 ? (
                <tr><td colSpan="3" style={{ padding: 40, textAlign: 'center', color: M }}>Aucun parrainage pour le moment. Partage ton code pour commencer !</td></tr>
              ) : (
                parrainages.map((ref, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${B}` }}>
                    <td style={{ padding: '15px 20px', fontSize: 13 }}>{ref.usedBy || "Utilisateur inconnu"}</td>
                    <td style={{ padding: '15px 20px', fontSize: 13, color: M }}>{ref.usedAt || "-"}</td>
                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                      <Pill color="green" xs>VALIDÉ</Pill>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
