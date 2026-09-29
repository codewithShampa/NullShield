# NullShield Product Proposal

**Zero-Knowledge Privacy-Preserving Voting and Governance Protocol on Midnight Network**

---

## 1. Product and User

### Problem Statement
In traditional digital governance—ranging from Web3 DAOs and shareholder resolutions to civic referendums and committee ballots—transparency and voter privacy are fundamentally at war:
- **On Transparent Blockchains (Ethereum, Solana):** Every ballot transaction discloses the voter's address, choice, and timestamp on a public ledger. This creates acute vulnerabilities to vote buying, voter intimidation, bribery, retaliation, and herd mentality (the bandwagon effect).
- **In Centralized Systems (Snapshot, Web2 Polling Platforms):** Systems rely on centralized databases or servers to collect votes. Administrators, hosting providers, or compromised servers can manipulate tallies, leak voter records, or log IP-to-identity mappings, requiring blind trust from participants.

### The NullShield Product
**NullShield** is a zero-knowledge confidential ballot and governance protocol built natively on the **Midnight Network**. It leverages the **Compact** smart contract language and zero-knowledge zk-SNARKs (Groth16) to provide mathematical ballot privacy with public ledger auditability:
1. **Ballot Secrecy:** A voter's selection (Yes/No) is evaluated as a private witness inside an in-browser zero-knowledge circuit. The raw choice never leaves the voter's local device and is never broadcast over the network.
2. **Public Auditability:** The Midnight ledger records verified increments to public counters (`total_yes`, `total_no`, `total_votes`), allowing anyone, anywhere, to verify the final tally and turnout in real time without trusting an intermediary.
3. **Sybil Resistance via Cryptographic Nullifiers:** Double voting is prevented through deterministic, domain-separated nullifiers (`nullshield:voter:v1`). The nullifier registers participation on-chain without revealing the voter's secret or linking back to their public wallet address.
4. **Verifiable Proof Receipts:** Voters export a deterministic client-side cryptographic receipt with SHA-256 checksums to independently prove their participation to verifiers or communities.
5. **Turnkey Governance Portal:** Includes an interactive web application with real-time Apollo GraphQL v4 Indexer sync, 1AM / Lace browser wallet support via `@midnight-ntwrk/dapp-connector-api`, and day/night adaptable ergonomics.

### Target Users
- **Decentralized Autonomous Organizations (DAOs):** Protocol treasuries, grant committees, and core governance councils requiring bribery-resistant, un-coerced voting on sensitive budget allocations or executive appointments.
- **Enterprise & Shareholder Boards:** Corporations and consortiums conducting confidential executive elections, mergers and acquisitions evaluations, and board resolutions that require legally verifiable totals without exposing individual board members' votes.
- **Civic Collectives & Unions:** Communities, research groups, and worker unions voting on policy reforms, petitions, or representative appointments where members must remain protected from workplace or political reprisal.
- **Individual Voters & Delegates:** Privacy-conscious token holders who refuse to dox their convictions or net worth to the public blockchain when exercising their governance rights.

---

## 2. Why Midnight Specifically

Conventional blockchain platforms and traditional web architectures cannot deliver confidential, verifiable governance:

1. **Native Dual-State Architecture (Public vs. Private):**
   Transparent chains treat all execution inputs as public. Midnight's fundamental programming model separates state into:
   - **Public Ledger State:** Open, immutable, and readable by indexers and blockchain explorers.
   - **Private Witness State:** Bound strictly to local client memory, evaluated inside the ZK prover, and never transmitted over the wire.
   NullShield leverages this dual-state model so that the counting logic is public and verifiable, while the voter's preference remains private.

2. **Compact Smart Contract Language:**
   Compact provides domain-specific language primitives designed specifically for zero-knowledge engineering:
   - Native `witness` declarations for client inputs (`voterSecret`, `choice`, `adminSecret`).
   - Explicit `disclose()` boundaries that alert the developer and prevent accidental information leaks.
   - Pure circuits (`pure circuit`) for deterministic hash derivations evaluated directly in zero-knowledge constraints.
   - Native ledger counters (`Counter`) and associative maps (`Map<Bytes<32>, Boolean>`) that guarantee atomic state updates on-chain.

3. **Client-Side Proving via DApp Connector API:**
   Midnight enables in-browser proof generation using WebAssembly and Web Workers through `@midnight-ntwrk/dapp-connector-api`. The voter connects their 1AM or Lace wallet, computes the Groth16 proof locally in sub-seconds, and submits only the zero-knowledge proof and public inputs to the Midnight node. No centralized proof server or untrusted backend ever sees the voter's entropy.

4. **Domain-Separated Cryptographic Nullifiers:**
   Midnight's built-in `persistentHash` and `pad` functions enable domain separation (`"nullshield:voter:v1"` vs `"nullshield:admin:v1"`). This ensures that nullifiers cannot be correlated across different protocols, different proposals, or administrative circuits, eliminating cross-contract linkage and tracking.

---

## 3. Data Model

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

## 4. Scope and Feasibility to Mainnet

### Current MVP Status (Levels 1 to 4 Complete)
NullShield has achieved and exceeded all requirements across Levels 1 through 4 of the Midnight builder milestone roadmap:
- **Verified Compact Smart Contract:** Implemented in `contracts/voting.compact` and compiled using `compact` compiler v0.31.0, generating complete ZKIR circuits and proving/verifying keys in `contracts/managed/voting/`.
- **Live Preprod Network Deployment:** Deployed to Midnight Preprod with verified on-chain address:
  [`b2aaa714ef5bf682770508545c23948a586e2929709ab440fe976abf9e25eca8`](https://explorer.1am.xyz/contract/b2aaa714ef5bf682770508545c23948a586e2929709ab440fe976abf9e25eca8?network=preprod)
- **Comprehensive Automated Test Suite (32 Tests):**
  - 24 unit tests covering nullifier determinism, domain separation (`v1` vs `v2`, voter vs admin), state transitions, quorum math, and receipt verification (`yarn test:unit`).
  - 8 end-to-end integration tests verifying contract deployment, double-vote rejection, and poll lifecycle against local devnet (`yarn test:local`).
- **Production-Grade Frontend & Wallet Integration:** Responsive React 19 + TypeScript + Vite web app deployed on Netlify ([https://nullshieldzk.netlify.app/](https://nullshieldzk.netlify.app/)) with 1AM / Lace wallet injection, interactive ZK terminal, Day/Night theme toggling, and real-time Apollo GraphQL v4 indexer updates.
- **Formal Audit Documentation:** Comprehensive security, privacy, and threat modeling documented in [`AUDIT.md`](AUDIT.md).
- **Automated CI/CD Pipeline:** GitHub Actions workflow ([`.github/workflows/ci.yaml`](.github/workflows/ci.yaml)) testing contract compilation, unit test suites, and frontend bundling on every push.

### Roadmap to Mainnet

To progress from the current Preprod MVP to an enterprise-grade Mainnet deployment, the NullShield engineering roadmap encompasses the following phases:

#### Phase 1: Factory Contract & Multi-Proposal Registry
- Implement a `VotingFactory.compact` contract that allows DAOs and organizers to deploy new polls on demand with customized parameters (title, description hash, voting duration, quorum threshold, and voter eligibility commitments).
- Maintain an on-chain registry of active and historical proposals accessible through standard Midnight indexers.

#### Phase 2: Timelocked Tallying & Threshold Decryption
- In the current MVP, running tallies increment live on the ledger. While vote choices remain private to each transaction, running tallies can introduce psychological bandwagoning.
- For Mainnet, implement threshold encryption / timelock encryption (via verifiable secret sharing or Midnight timelock primitives) so that cumulative results remain sealed until the proposal deadline passes.

#### Phase 3: Range-Proof Stake Weighting & Quadratic Voting
- Extend the circuit to support token-weighted voting and quadratic voting without disclosing voter balances.
- Use zero-knowledge range proofs to attest that a voter holds at least $N$ governance tokens on Midnight without broadcasting their exact balance or unshielded UTXO.

#### Phase 4: Formal Security Audits & Proving Optimization
- Engage third-party zero-knowledge cryptographic auditors to perform formal verification of the Compact circuits, constraint systems, and nullifier collision resistance.
- Optimize ZK proving key sizes and memory footprints to facilitate mobile proving in iOS/Android browser environments.

#### Phase 5: Production Node Infrastructure & Governance Tooling
- Deploy redundant, geographically distributed Midnight observer nodes and Apollo GraphQL indexer clusters with automated failover.
- Introduce snapshot export tools and signed cryptographic audit certificates allowing organizations to archive and verify finalized election results with zero external dependencies.

---

### Conclusion
NullShield demonstrates that governance on public blockchains does not require sacrificing individual privacy. By leveraging Midnight's dual-state Compact architecture, NullShield delivers an auditable, Sybil-resistant, and mathematically confidential voting protocol ready for the future of decentralized governance.
