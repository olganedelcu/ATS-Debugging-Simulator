import type { AtsApiResponse } from "../mock/data";

interface ResponseBoxProps {
  response: AtsApiResponse;
}

export function ResponseBox({ response }: ResponseBoxProps) {
  return (
    <div className={`response-box ${response.success ? "success" : "error"}`}>
      <h4>API Response</h4>
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
}
