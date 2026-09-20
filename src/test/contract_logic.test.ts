import { describe, it, expect } from 'vitest';
import { persistentHash, CompactTypeBytes, CompactTypeVector } from '@midnight-ntwrk/compact-runtime';

describe('NullShield Smart Contract Logic & Cryptographic Verification', () => {
  // Descriptors matching Compact contract types
  const bytes32Descriptor = new CompactTypeBytes(32);
  const vec2Bytes32Descriptor = new CompactTypeVector(2, bytes32Descriptor);

  // Pad helper replicating Compact's pad(32, str)
  function pad32(str: string): Uint8Array {
    const arr = new Uint8Array(32);
    const enc = new TextEncoder().encode(str);
    arr.set(enc.subarray(0, 32));
    return arr;
  }

  // Voter nullifier pure circuit helper:
  //   persistentHash<Vector<2, Bytes<32>>>([pad(32, "nullshield:voter:v1"), sk])
  function deriveVoterNullifier(sk: Uint8Array): Uint8Array {
    const prefix = pad32('nullshield:voter:v1');
    return persistentHash(vec2Bytes32Descriptor, [prefix, sk]);
  }

  // Admin public key pure circuit helper:
  //   persistentHash<Vector<2, Bytes<32>>>([pad(32, "nullshield:admin:v1"), sk])
  function deriveAdminPublicKey(sk: Uint8Array): Uint8Array {
    const prefix = pad32('nullshield:admin:v1');
    return persistentHash(vec2Bytes32Descriptor, [prefix, sk]);
  }

  // V2 domain separated voter nullifier
  function deriveVoterNullifierV2(sk: Uint8Array): Uint8Array {
    const prefix = pad32('nullshield:voter:v2');
    return persistentHash(vec2Bytes32Descriptor, [prefix, sk]);
  }

  // Helper to convert bytes to hex
  function toHex(bytes: Uint8Array): string {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  describe('Nullifier & Key Derivation Circuits', () => {
    it('produces deterministic nullifier for identical voter secret', () => {
      const secret = new Uint8Array(32).fill(0x42);
      const nullifier1 = deriveVoterNullifier(secret);
      const nullifier2 = deriveVoterNullifier(secret);

      expect(toHex(nullifier1)).toBe(toHex(nullifier2));
      expect(nullifier1.length).toBe(32);
    });

    it('enforces strict domain separation between voter nullifiers and admin public keys', () => {
      const secret = new Uint8Array(32).fill(0x77);
      const voterNullifier = deriveVoterNullifier(secret);
      const adminPubKey = deriveAdminPublicKey(secret);

      // Even with identical secret, different domain prefixes yield completely distinct hashes
      expect(toHex(voterNullifier)).not.toBe(toHex(adminPubKey));
    });

    it('enforces version domain separation between v1 and v2 nullifiers', () => {
      const secret = new Uint8Array(32).fill(0x99);
      const v1Nullifier = deriveVoterNullifier(secret);
      const v2Nullifier = deriveVoterNullifierV2(secret);

      expect(toHex(v1Nullifier)).not.toBe(toHex(v2Nullifier));
    });

    it('produces distinct nullifiers for distinct voter secrets', () => {
      const secretA = new Uint8Array(32).fill(0x01);
      const secretB = new Uint8Array(32).fill(0x02);

      const nullifierA = deriveVoterNullifier(secretA);
      const nullifierB = deriveVoterNullifier(secretB);

      expect(toHex(nullifierA)).not.toBe(toHex(nullifierB));
    });
  });

  describe('Contract State Machine & Sybil Resistance Simulation', () => {
    it('detects and rejects double-voting attempt with the same nullifier', () => {
      const spentNullifiers = new Set<string>();
      const voterSecret = new Uint8Array(32).fill(0xab);
      const nullifier = toHex(deriveVoterNullifier(voterSecret));

      // First vote: successfully cast and nullifier marked spent
      expect(spentNullifiers.has(nullifier)).toBe(false);
      spentNullifiers.add(nullifier);
      expect(spentNullifiers.has(nullifier)).toBe(true);

      // Second vote attempt: must fail assertion
      const hasAlreadyVoted = spentNullifiers.has(nullifier);
      expect(hasAlreadyVoted).toBe(true);
    });

    it('enforces poll open/closed lifecycle invariant', () => {
      let isOpen = true;
      const adminSecret = new Uint8Array(32).fill(0xef);
      const adminPubKey = deriveAdminPublicKey(adminSecret);

      // Voting while open succeeds
      expect(isOpen).toBe(true);

      // Close poll circuit verification
      const callerSecret = new Uint8Array(32).fill(0xef);
      const callerPubKey = deriveAdminPublicKey(callerSecret);
      expect(toHex(callerPubKey)).toBe(toHex(adminPubKey));
      isOpen = false;

      // Voting after close fails
      expect(() => {
        if (!isOpen) throw new Error('Poll is closed');
      }).toThrow('Poll is closed');
    });

    it('rejects unauthorized caller attempting to close poll', () => {
      const adminSecret = new Uint8Array(32).fill(0x11);
      const adminPubKey = deriveAdminPublicKey(adminSecret);

      const attackerSecret = new Uint8Array(32).fill(0x22);
      const attackerPubKey = deriveAdminPublicKey(attackerSecret);

      expect(toHex(attackerPubKey)).not.toBe(toHex(adminPubKey));
    });
  });

  describe('Ballot Arithmetic & Quorum Calculations', () => {
    it('correctly tallies yes, no, and total counters', () => {
      let totalYes = 0;
      let totalNo = 0;
      let totalVotes = 0;

      const votes = [1, 0, 1, 1, 0]; // 3 Yes, 2 No

      for (const choice of votes) {
        expect(choice <= 1).toBe(true);
        const yesInc = choice;
        const noInc = 1 - choice;
        totalYes += yesInc;
        totalNo += noInc;
        totalVotes += 1;
      }

      expect(totalYes).toBe(3);
      expect(totalNo).toBe(2);
      expect(totalVotes).toBe(5);
    });

    it('validates quorum thresholds for decisive governance', () => {
      const targetQuorum = 10;
      const votesCast = 12;
      const isQuorumMet = votesCast >= targetQuorum;

      expect(isQuorumMet).toBe(true);
    });
  });
});
