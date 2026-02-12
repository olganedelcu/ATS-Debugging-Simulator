interface ResolutionPanelProps {
  selectedJobKomboId: string;
  onReset: () => void;
}

export function ResolutionPanel({ selectedJobKomboId, onReset }: ResolutionPanelProps) {
  return (
    <div className="resolution-panel">
      <h4>Resolution Summary</h4>
      <div className="lesson">
        <strong>Bug #1 - Wrong ID type:</strong> The app sent Kombo's
        internal UUID (<code>komboId</code>) to the ATS, which expects its
        own provider ID (<code>remoteId</code>). Always use the{" "}
        <code>remote_id</code> field when making calls that reach the
        underlying ATS.
      </div>
      {selectedJobKomboId === "kombo-uuid-bb22" && (
        <div className="lesson">
          <strong>Bug #2 - Stale sync data:</strong> Kombo's last sync was
          3 days ago, so the job still appeared "open" locally. In
          reality the ATS archived it yesterday. Build in freshness
          checks or force a re-sync before critical operations.
        </div>
      )}
      <button className="btn" onClick={onReset}>
        Start Over
      </button>
    </div>
  );
}
