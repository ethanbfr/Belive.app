// Remplace la fonction AdminView dans ton code par celle-ci ou vérifie la section Parrainage :

const AdminParrainageView = () => {
  const adminRefs = referrals; // Utilise tes données de referrals
  
  return (
    <div className="fade" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: 30 }}>
        <h2 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 32, color: R, letterSpacing: 1 }}>
          GESTION DES PARRAINAGES
        </h2>
        <p style={{ color: M, fontSize: 14 }}>Suivi des invitations et des réductions accordées aux créateurs.</p>
      </div>

      {/* Stats Parrainage en GRAND */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 30 }}>
        <SC label="Total Codes" value={adminRefs.length} icon="🎟️" color="blue" />
        <SC label="Parrainages Réussis" value={adminRefs.filter(r => r.usedBy).length} icon="✅" color="green" />
        <SC label="Taux de conversion" value={adminRefs.length ? Math.round((adminRefs.filter(r => r.usedBy).length / adminRefs.length) * 100) + "%" : "0%"} icon="📊" color="purple" />
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: `1px solid ${B}` }}>
                <th style={{ padding: '15px 20px', textAlign: 'left', color: M }}>PARRAIN (CRÉATEUR)</th>
                <th style={{ padding: '15px 20px', textAlign: 'left', color: M }}>CODE</th>
                <th style={{ padding: '15px 20px', textAlign: 'left', color: M }}>FILLEUL</th>
                <th style={{ padding: '15px 20px', textAlign: 'left', color: M }}>DATE</th>
                <th style={{ padding: '15px 20px', textAlign: 'right', color: M }}>STATUT</th>
              </tr>
            </thead>
            <tbody>
              {adminRefs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: 40, textAlign: 'center', color: M }}>Aucun parrainage enregistré pour le moment.</td>
                </tr>
              ) : (
                adminRefs.map((ref, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${B}`, transition: 'background 0.2s' }}>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ fontWeight: 700 }}>{ref.ownerName}</div>
                      <div style={{ fontSize: 11, color: M }}>{ref.owner}</div>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      <code style={{ background: B, padding: '4px 8px', borderRadius: 4, color: BL }}>{ref.code}</code>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      {ref.usedBy ? <span style={{ color: 'white' }}>{ref.usedBy}</span> : <span style={{ color: M, fontStyle: 'italic' }}>En attente...</span>}
                    </td>
                    <td style={{ padding: '15px 20px', color: M }}>{ref.usedAt || ref.createdAt}</td>
                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                      {ref.usedBy ? <Pill color="green" xs>UTILISÉ</Pill> : <Pill color="gray" xs>ACTIF</Pill>}
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
};
