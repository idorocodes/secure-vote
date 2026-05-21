# Secure-Vote: A Dual-Database, Tamper-Evident University Voting Platform

Secure-Vote is a modern, high-integrity online voting platform engineered specifically for university student elections. It solves the traditional "black box" dilemma of electronic voting by replacing blind trust with mathematical verifiability. 

Unlike conventional campus portals where database administrators can alter vote tallies undetected, this platform implements a decentralized-style architecture using standard relational databases. By decoupling voter identity from the ballot box and chaining votes cryptographically, the system achieves perfect voter anonymity alongside absolute, auditable data integrity.

---

## 🚀 Key Innovations & Solved Problems

| Traditional System Flaws | Secure-Vote Solutions |
| :--- | :--- |
| **Admin Rigging / Inside Threats:** Admins or hackers can alter database tallies mid-election. | **Tamper-Evident Hash Chain:** Every ballot is cryptographically linked to the one before it. Altering a past vote breaks the entire chain. |
| **Lack of Voter Trust:** Students cannot verify if their specific vote was actually counted. | **Public Auditable Ledger:** Voters receive an anonymous, hashed receipt token to locate and verify their ballot in a published post-election ledger. |
| **Privacy Leaks:** Database administrators can use SQL `JOIN` queries to map student IDs to candidate choices. | **Dual-Database Isolation:** Complete architectural separation between identity tracking and the ballot box with zero shared identifiers. |

---

## 🏗️ System Architecture & Data Flow

The platform enforces a strict **Separation of Concerns** by splitting operations across two isolated database instances. The backend application acts as a blind broker between them.


```

[ Student Logs In ]
│
▼
┌────────────────────────────────────────────────────────┐
│ DATABASE 1: Identity & Participation Ledger           │
│ 1. Verify student registration & eligibility          │
│ 2. Check if already voted (Block if True)              │
│ 3. Mark student as "Voted"                             │
└────────────────────────────────────────────────────────┘
│
│ ──(Backend drops Student ID from memory)
▼ ──(Passes ONLY Candidate choice onward)
┌────────────────────────────────────────────────────────┐
│ DATABASE 2: Cryptographic Ballot Box                  │
│ 1. Lock table tail & fetch latest current_hash         │
│ 2. Generate random Voter Receipt Token                 │
│ 3. Compute: SHA-256(Choice + Token + Previous Hash)     │
│ 4. Commit new block to the Hash Chain                 │
└────────────────────────────────────────────────────────┘
│
▼
[ Issue Hashed Receipt to Student Screen ]

```

---

## 🗄️ Database Schemas

### 1. Identity & Participation Database (`university_voters_db`)
Tracks who has the right to vote and whether they have exercised it. It contains zero knowledge of candidate choices.

```sql
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    matric_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    faculty VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL,
    level INT NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE participation_ledger (
    ledger_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    election_id INT NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_voter_election (student_id, election_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

```

### 2. Cryptographic Ballot Box Database (`university_ballot_box_db`)

Stores the anonymous ballots. It has no foreign keys or links pointing back to the student data.

```sql
CREATE TABLE public_ballot_box (
    ballot_id INT AUTO_INCREMENT PRIMARY KEY,
    election_id INT NOT NULL,
    position_id INT NOT NULL,
    candidate_id INT NOT NULL,
    voter_token VARCHAR(32) NOT NULL, 
    previous_hash CHAR(64) NOT NULL,
    current_hash CHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_election_sequence (election_id, ballot_id ASC)
);

```

---

## 🛠️ The Tamper-Evident Hashing Mechanics

When a ballot is inserted into Database 2, the `current_hash` is computed as follows:

$$\text{Input String} = \text{position\_id} + \text{"-"} + \text{candidate\_id} + \text{"-"} + \text{voter\_token} + \text{"-"} + \text{previous\_hash}$$

$$\text{current\_hash} = \text{SHA-256}(\text{Input String})$$

* **The Chain Link:** By embedding the `previous_hash` into the current calculation, the entire history of the election is baked into the latest entry.
* **The Genesis Block:** The first vote cast in any election defaults to a hardcoded `previous_hash` of sixty-four zeros (`00000000...`).
* **Race-Condition Protection:** Database write operations use `SELECT ... FOR UPDATE` row-locking transactions to guarantee sequential execution under heavy traffic concurrency.

---

## 🕵️‍♂️ The Verification & Audit Protocol

### Post-Election Student Verification

1. Once the voting portal closes, the administration publishes the raw, anonymous rows of `public_ballot_box` as a public document or webpage.
2. A student opens the ledger and performs a text search (**Ctrl + F**) for their unique `current_hash` receipt.
3. Finding their exact hash string proves their ballot exists inside the database and was factored into the final aggregation tally.

### System-Wide Integrity Audit

The application features an administrative background script that re-runs the mathematical link calculations sequentially from the genesis block to the final vote. If an unauthorized actor manipulates a column directly in the database server, the cryptographic seal breaks:

```javascript
// Algorithmic verification routine
let expectedPreviousHash = "00000000..."; 

for (let ballot of electionBallots) {
    if (ballot.previous_hash !== expectedPreviousHash) {
        throw new Error(`CRITICAL FRAUD DETECTED: Chain broken at Ballot ID ${ballot.ballot_id}`);
    }
    
    let calculated = crypto.createHash('sha256')
        .update(`${ballot.position_id}-${ballot.candidate_id}-${ballot.voter_token}-${ballot.previous_hash}`)
        .digest('hex');
        
    if (ballot.current_hash !== calculated) {
        throw new Error(`CRITICAL FRAUD DETECTED: Content modification at Ballot ID ${ballot.ballot_id}`);
    }
    expectedPreviousHash = ballot.current_hash;
}
console.log("SUCCESS: Election database integrity verified. Zero anomalies.");

```

---

## ⚙️ Setup and Installation

### Prerequisites

* Node.js (v18+ recommended)
* MySQL Server or PostgreSQL Server (Two running instances or distinct databases)

### Installation Steps

1. Clone the repository:
```bash
git clone [https://github.com/yourusername/secure-vote.git](https://github.com/yourusername/secure-vote.git)
cd secure-vote

```


2. Install project backend dependencies:
```bash
npm install

```


3. Configure your local environment variables in a `.env` file:
```env
PORT=3000
DB_VOTERS_URL=mysql://root:password@127.0.0.1:3306/university_voters_db
DB_BALLOT_URL=mysql://root:password@127.0.0.1:3306/university_ballot_box_db
JWT_SECRET=your_super_secure_auth_token

```


4. Run the database initialization scripts to seed sample departments and positions:
```bash
npm run db:init

```


5. Spin up the local development engine:
```bash
npm run dev
```

## 🧑‍💻 Technology Stack Details
*   **Frontend Framework:** React.js initialized via Vite. State architecture handles data loading locally to maintain dynamic response metrics and eliminate database polling overhead.
*   **Backend Application Server:** Node.js environment powered by the Express framework for decoupled API endpoint routing.
*   **Cryptography Modules:** Native Node.js `crypto` engine running deterministic SHA-256 parameters.
*   **UI Typography & Assets:** Icon mapping structured natively through the **Font Awesome** toolkit.


```

```
