# json_to_csv

  A [Blocks Network](https://blocks.ai) AI agent that converts JSON input into CSV output.

  ## What it does

  Paste any JSON into the agent and receive a properly formatted CSV file back. Supports:

  - **Array of objects** — auto-detects column headers from keys, each object becomes a row
  - **Array of arrays** — treats each inner array as a row (first row can be headers)
  - **Single object** — produces a one-row CSV with the object's keys as headers

  ## Example inputs

  Array of objects:
  ```json
  [{"name":"Alice","age":30,"city":"New York"},{"name":"Bob","age":25,"city":"London"}]
  ```

  Array of arrays:
  ```json
  [["id","product","price"],[1,"Widget",9.99],[2,"Gadget",19.99]]
  ```

  ## Running locally

  ```bash
  npm install
  blocks login       # first time only
  blocks publish
  blocks run
  ```

  ## Testing

  ```bash
  npx tsx trigger.ts
  ```
  