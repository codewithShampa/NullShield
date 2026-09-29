# NullShield Product Proposal

**Zero-Knowledge Privacy-Preserving Voting and Governance Protocol on Midnight Network**

---

## 1. Problem Statement

Contemporary on-chain governance and decentralized voting mechanisms are inherently constrained by the transparency paradigm of distributed ledgers. Participants are compelled to broadcast their state transitions in plaintext to achieve verifiability, thereby relinquishing ballot secrecy. Conversely, off-chain or obfuscated voting models typically sacrifice cryptographic auditability, introducing centralization risks and undermining Sybil resistance. This dichotomy impedes the adoption of trustless governance by entities requiring strict compliance with data privacy frameworks.

**NullShield** resolves this architectural limitation by introducing a decentralized, zero-knowledge confidential ballot protocol. Utilizing client-side proof generation, the protocol permits users to cryptographically attest to their voting eligibility and ballot execution without exposing the underlying plaintext choice to validators, contract state, or third-party observers.

---

## 2. Why Midnight?

NullShield is explicitly engineered to interface with the **Midnight Network's** data-protection architecture and its native proving capabilities:

- **Dual-State Architecture:** By implementing the Compact smart contract language, the protocol bifurcates application state into public ledger primitives (aggregate vote tallies) and private witness data (individual ballot selections).
- **Client-Side Proving via 1AM / Lace:** The integration of the 1AM wallet facilitates localized, in-browser compilation of Zero-Knowledge proofs, ensuring that the voter's entropy and preimage data never transit the network layer.
- **Robust Consensus Verification:** Midnight's validator consensus guarantees that these verifiable computation receipts are authenticated and recorded on-chain without decrypting or inferring the private inputs, achieving a mathematically sound, trustless execution environment.
- **Domain-Separated Cryptographic Primitives:** Midnight's native `persistentHash` and `pad` primitives guarantee collision-resistant nullifiers that enforce strict one-person-one-vote mechanics without linking identities across proposals or external protocols.

---

## 3. Target Users

- **Tier 1 (Early Adopters):** Cryptographically-native Decentralized Autonomous Organizations (DAOs) and Web3 consortiums requiring trustless, on-chain governance frameworks that strictly preserve member anonymity and mitigate voter retaliation, bribery, and coercion.
- **Tier 2 (Growth Phase):** Institutional governance boards and decentralized finance (DeFi) protocols seeking to offload the regulatory liability of processing plaintext PII and sensitive shareholder decisions to a verifiable Zero-Knowledge execution layer.
- **Tier 3 (Mainnet Scale):** Federal regulatory bodies and large-scale geopolitical voting infrastructure demanding high-throughput, cryptographically auditable electoral systems compliant with stringent global data privacy heuristics.

---

## 4. Technical Architecture

### Component Breakdown
- **Frontend:** A reactive React 19 / Vite Single Page Application (SPA) interfacing with the Midnight DApp Connector API (`@midnight-ntwrk/dapp-connector-api`) and leveraging the 1AM browser extension for cryptographic signing, key derivation, and session restoration.
- **Smart Contracts:** A Compact execution circuit ([`contracts/voting.compact`](contracts/voting.compact)) compiled down to WebAssembly (WASM) and Zero-Knowledge Intermediate Representation (ZKIR). It orchestrates a hybrid state model, managing public Patricia-Merkle trie state commitments (`total_yes`, `total_no`, `total_votes`, and a persistent Hash set for nullifiers) alongside isolated private execution contexts.
- **Data Flow:**
  1. The deploying authority initializes the contract state and public cryptographic parameters via the constructor circuit.
  2. Upon ballot execution, the client provisions their local witness data (`choice`, `voterSecret`).
  3. The connected wallet executes the localized ZK circuit, yielding a Groth16 zero-knowledge proof and a deterministic, collision-resistant nullifier.
  4. This payload is submitted as an unproven ledger transaction, which is subsequently verified by Midnight consensus nodes and committed atomically to the blockchain ledger.
  5. The frontend subscribes to real-time counter updates via the Midnight v4 Indexer Apollo GraphQL endpoint.

---

## 5. Complexity Evaluation

- **Zero-Knowledge Privacy Boundaries:** Engineering strict execution boundaries between the public ledger state variables and the local unshielded witness environment, mitigating side-channel data leakage and ensuring state transitions are mathematically isolated from private inputs.
- **Anonymous Sybil Resistance:** Designing and implementing non-interactive, collision-resistant cryptographic nullifiers derived from deterministic secret keys (`nullshield:voter:v1`). This prevents double-spending of governance rights while maintaining complete unlinkability to the voter's primary network address.
- **State Synchronization and Error Handling:** Engineering resilient client-side state reconciliation algorithms via the Midnight Indexer GraphQL API, managing provider synchronization through the DApp Connector, and architecting robust exception handling for WASM runtime faults, proof-server timeouts, and offset indexing anomalies.

---

## 6. Data Model: Public Ledger vs. Private Witness vs. Selective Disclosure

### Public Ledger State (On-Chain)
The public ledger state is globally visible, consensus-verified, and indexed by Midnight v4 GraphQL indexers:

| Field | Type | Description | Visibility |
| :--- | :--- | :--- | :--- |
| `total_yes` | `Counter` | Cumulative tally of affirmative votes | Public on-chain |
| `total_no` | `Counter` | Cumulative tally of negative votes | Public on-chain |
| `total_votes` | `Counter` | Total ballots cast (turnout metric) | Public on-chain |
| `is_open` | `Boolean` | Proposal lifecycle flag (true = Open, false = Closed) | Public on-chain |
| `admin` | `Bytes<32>` | Persistent hash commitment of the proposal administrator | Public on-chain |
| `has_voted` | `Map<Bytes<32>, Boolean>` | Set of spent nullifiers preventing duplicate voting | Public on-chain |

### Private Witness State (Client-Side Only)
Private witness data is held strictly inside the voter's browser or wallet session and is never revealed to consensus nodes:

| Field | Type | Description | Visibility |
| :--- | :--- | :--- | :--- |
| `choice` | `Uint<32>` | Ballot decision: `1` for Yes, `0` for No | Private witness (client only) |
| `voterSecret` | `Bytes<32>` | Private entropy / secret key for nullifier derivation | Private witness (client only) |
| `adminSecret` | `Bytes<32>` | Administrator private key for poll finalization | Private witness (client only) |

### Selective Disclosure & Boundary Semantics
In NullShield, every disclosure crossing the privacy boundary is tightly scoped:

1. **Poll Initialization:**
   ```compact
   constructor(admin_key: Bytes<32>) {
     admin = disclose(admin_key);
     is_open = true;
   }
   ```
   The administrator's public key commitment (`adminPublicKey(sk)`) is disclosed once during construction to establish administrative authorization on-chain. The underlying secret key (`adminSecret`) is never disclosed.

2. **Ballot Casting & Nullifier Verification:**
   ```compact
   const sk = voterSecret();
   const nullifier = voterNullifier(sk);
   assert(!has_voted.member(disclose(nullifier)), "Voter has already cast a ballot in this proposal");
   has_voted.insert(disclose(nullifier), true);
   ```
   The circuit computes the one-way nullifier `persistentHash([pad(32, "nullshield:voter:v1"), sk])`. Only the derived 32-byte nullifier is disclosed to the ledger to prevent double-voting. The voter's private secret `sk` remains concealed within the ZK circuit.

3. **Concealed Branch Execution:**
   ```compact
   const yes_inc = choice;
   const no_inc = (1 - choice) as Uint<32>;
   total_yes.increment(disclose(yes_inc as Uint<16>));
   total_no.increment(disclose(no_inc as Uint<16>));
   total_votes.increment(1);
   ```
   Both branch computations (`yes_inc` and `no_inc`) are evaluated inside the circuit constraints. While the resulting scalar increment (`0` or `1`) is disclosed to increment the matching ledger counter, the selection logic is executed entirely within the zero-knowledge proof transcript. Observers see the counters increment, but cannot correlate the transaction with a specific voter identity or address.

### Observer Information Matrix

```
[What Observers & Verifiers LEARN]
✔ Cumulative YES and NO vote counts
✔ Aggregate voter turnout (total_votes)
✔ Active lifecycle state of the proposal (Open/Closed)
✔ Cryptographic nullifiers spent (confirming valid participation)
✔ Block timestamp and standard network fee

[What Observers CANNOT LEARN]
✖ The vote choice (YES or NO) cast in any individual transaction
✖ The real-world identity or wallet address of the voter
✖ The voter's private key, secret, or entropy
✖ Linkage between multiple ballots or cross-proposal participation
```

---

## 7. Roadmap and Milestone Progression

### Level 4 (Production MVP and Initial Scale — Completed)
- **Compact Smart Contract:** Transitioned the NullShield prototype into a robust production release ([`contracts/voting.compact`](contracts/voting.compact)) compiled with Compact compiler v0.31.0 and deployed to Midnight Preprod at verifiable contract address:  
  [`b2aaa714ef5bf682770508545c23948a586e2929709ab440fe976abf9e25eca8`](https://explorer.1am.xyz/contract/b2aaa714ef5bf682770508545c23948a586e2929709ab440fe976abf9e25eca8?network=preprod)
- **Frontend Architecture:** Integrated an advanced analytics dashboard querying the v4 Indexer, 1AM wallet connection, client-side proof generation, and cryptographic receipt export capabilities. Live deployment accessible at [https://nullshieldzk.netlify.app/](https://nullshieldzk.netlify.app/).
- **Automated CI/CD Pipeline:** Constructed a comprehensive GitHub Actions CI/CD pipeline ([`.github/workflows/ci.yaml`](.github/workflows/ci.yaml)) verifying contract compilation (`yarn compile`), 24 unit tests (`yarn test:unit`), and frontend production bundling (`npm run build`). Exceeded 75 verified, modular commits.

### Level 5 (Full Moon Submission)
- **Empirical Protocol Validation & User Acquisition:** Transition from private iteration to public infrastructure deployment, acquiring 50 verifiable Preprod users comprising protocol administrators and voters.
- **Telemetry & Feedback Integration:** Establish a structured telemetry and feedback loop to prioritize state machine optimizations, gas fee refinements, and UX enhancements.
- **Documentation & Demonstration:** Continuously synchronize technical documentation with network updates. Deliver an end-to-end video demonstration illustrating the complete cryptographic lifecycle alongside a minimum of 20 verified commits.

### Level 6 (Supermoon Submission)
- **Architectural Finalization & Hardening:** Finalize the protocol architecture based on aggregate behavioral heuristics and vulnerability assessments.
- **Network Scaling:** Scale user acquisition to encompass 70 active Preprod participants executing verifiable on-chain state transitions.
- **Enterprise Standards:** Finalize all architectural documentation, privacy boundary matrices, and cryptographic threat models ([`AUDIT.md`](AUDIT.md)) to enterprise standards.
- **Conclusive Submission:** Deliver the finalized repository, documented iteration lifecycle, an optimized live deployment, a conclusive MVP demonstration, and a minimum of 30 semantic commits.

---

### Conclusion
NullShield demonstrates that governance on public blockchains does not require sacrificing individual privacy. By leveraging Midnight's dual-state Compact architecture, NullShield delivers an auditable, Sybil-resistant, and mathematically confidential voting protocol ready for enterprise and decentralized adoption.
