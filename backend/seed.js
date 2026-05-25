import { identityDb, ballotDb } from "./config/db.js";
import bcrypt from "bcrypt";

const seedDatabase = async () => {
  console.log("🚀 Starting Multi-Database Seeding Process...");

  try {
    // ----------------------------------------------------
    // CLEANUP: Wipe old data to avoid unique ID conflicts
    // ----------------------------------------------------
    console.log("🧹 Cleaning old records...");
    await identityDb.from("candidates").delete().neq("candidate_id", 0);
    await identityDb.from("positions").delete().neq("position_id", 0);
    await identityDb.from("participation_ledger").delete().neq("ledger_id", 0);
    await identityDb.from("students").delete().neq("student_id", 0);
    await identityDb.from("elections").delete().neq("election_id", 0);

    await ballotDb.from("public_ballot_box").delete().neq("ballot_id", 0);
    await ballotDb.from("candidates").delete().neq("candidate_id", 0);
    await ballotDb.from("positions").delete().neq("position_id", 0);
    await ballotDb.from("elections").delete().neq("election_id", 0);

    // ----------------------------------------------------
    // STEP 1: Seed Sample Students (Identity DB Only)
    // ----------------------------------------------------
    console.log("👤 Seeding test student credentials into Identity DB...");
    const defaultPasswordHash = await bcrypt.hash("password123", 10);

    const { data: students, error: studentErr } = await identityDb
      .from("students")
      .insert([
        {
          matric_number: "RUN/CMP/22/1001",
          full_name: "Theophilus Ayeloja",
          faculty: "Natural Sciences",
          department: "Computer Science",
          level: 400,
          password_hash: defaultPasswordHash
        },
        {
          matric_number: "RUN/ENG/22/2045",
          full_name: "Idoro Codes",
          faculty: "Engineering",
          department: "Software Engineering",
          level: 300,
          password_hash: defaultPasswordHash
        },
        {
          matric_number: "RUN/MHS/23/1102",
          full_name: "Jane Doe",
          faculty: "Basic Medical Sciences",
          department: "Nursing",
          level: 200,
          password_hash: defaultPasswordHash
        }
      ])
      .select();

    if (studentErr) throw studentErr;
    console.log(`✅ Seeded ${students.length} students successfully. (Password for all: password123)`);

    // ----------------------------------------------------
    // STEP 2: Seed Election Ecosystem (Synced Across Both)
    // ----------------------------------------------------
    console.log("🗳️ Provisioning election structural trees across both clusters...");

    // A. Root Election Layout
    const electionData = {
      title: "2026 Student Union Government Elections",
      description: "Annual voting exercise for executive council offices."
    };

    const { data: idElection, error: idElecErr } = await identityDb
      .from("elections")
      .insert({ ...electionData, is_active: true })
      .select()
      .single();

    if (idElecErr) throw idElecErr;

    await ballotDb
      .from("elections")
      .insert({ election_id: idElection.election_id, ...electionData, is_active: true });

    // B. Positions & Nested Candidates Dataset
    const layout = [
      {
        title: "President",
        candidates: [
          { full_name: "Alex Vance", faculty: "Sciences", manifesto: "Bringing transparency back to student union assets." },
          { full_name: "David Wright", faculty: "Management", manifesto: "Driving commercial sponsorships for social campus initiatives." }
        ]
      },
      {
        title: "Vice President",
        candidates: [
          { full_name: "Sophia Martinez", faculty: "Arts", manifesto: "Fostering inclusive representation across minority departments." }
        ]
      }
    ];

    // Mirror structures into both databases matching IDs
    for (const pos of layout) {
      const { data: idPos, error: idPosErr } = await identityDb
        .from("positions")
        .insert({ election_id: idElection.election_id, title: pos.title })
        .select()
        .single();

      if (idPosErr) throw idPosErr;

      await ballotDb
        .from("positions")
        .insert({ position_id: idPos.position_id, election_id: idElection.election_id, title: pos.title });

      for (const cand of pos.candidates) {
        const { data: idCand, error: idCandErr } = await identityDb
          .from("candidates")
          .insert({ position_id: idPos.position_id, full_name: cand.full_name, faculty: cand.faculty, manifesto: cand.manifesto })
          .select()
          .single();

        if (idCandErr) throw idCandErr;

        await ballotDb
          .from("candidates")
          .insert({
            candidate_id: idCand.candidate_id,
            position_id: idPos.position_id,
            full_name: cand.full_name,
            faculty: cand.faculty,
            manifesto: cand.manifesto
          });
      }
    }

    console.log("🎉 Database seeding complete! Clusters fully aligned and ready for voting.");
    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding terminated with critical error:", error);
    process.exit(1);
  }
};

seedDatabase();