const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function migrateDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✓ Connected to PostgreSQL database');

    // Create users table
    console.log('\n📦 Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Users table created');

    // Create patients table
    console.log('\n📦 Creating patients table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        surname VARCHAR(255) NOT NULL,
        id_number VARCHAR(50),
        date_of_birth DATE,
        age INTEGER,
        gender VARCHAR(20),
        contact_number VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        emergency_contact_name VARCHAR(255),
        emergency_contact_number VARCHAR(50),
        medical_aid_name VARCHAR(255),
        medical_aid_number VARCHAR(100),
        medical_history TEXT,
        current_medications TEXT,
        allergies TEXT,
        dental_history TEXT,
        previous_treatments TEXT,
        chief_complaint TEXT,
        images TEXT[] DEFAULT '{}',
        treatment_plan TEXT,
        treatment_notes TEXT,
        next_appointment TIMESTAMP,
        payments JSONB DEFAULT '[]',
        total_amount_due NUMERIC(10,2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('✓ Patients table created');

    // Create indexes
    console.log('\n📑 Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_patients_tenant_id ON patients(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
      CREATE INDEX IF NOT EXISTS idx_patients_surname ON patients(surname);
    `);
    console.log('✓ Indexes created');

    // Create trigger for auto-updating updated_at
    console.log('\n⚙️  Creating triggers...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
      CREATE TRIGGER update_patients_updated_at 
        BEFORE UPDATE ON patients 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✓ Triggers created');

    // Insert demo user
    console.log('\n👤 Creating demo user...');
    const demoPassword = await bcrypt.hash('demo123', 10);
    
    try {
      await client.query(`
        INSERT INTO users (email, password_hash) 
        VALUES ($1, $2)
        ON CONFLICT (email) DO NOTHING;
      `, ['demo@smilehub.com', demoPassword]);
      console.log('✓ Demo user created (email: demo@smilehub.com, password: demo123)');
    } catch (err) {
      console.log('ℹ️  Demo user already exists');
    }

    // Get demo user ID
    const userResult = await client.query('SELECT id FROM users WHERE email = $1', ['demo@smilehub.com']);
    const demoUserId = userResult.rows[0]?.id;

    if (demoUserId) {
      // Insert sample patients
      console.log('\n🏥 Creating sample patients...');
      
      const patients = [
        {
          name: 'John',
          surname: 'Doe',
          id_number: '8901015800083',
          date_of_birth: '1989-01-01',
          age: 35,
          gender: 'Male',
          contact_number: '+27 82 123 4567',
          email: 'john.doe@example.com',
          address: '123 Main Street, Cape Town, 8001',
          emergency_contact_name: 'Jane Doe',
          emergency_contact_number: '+27 82 765 4321',
          medical_aid_name: 'Discovery Health',
          medical_aid_number: 'DH123456789',
          medical_history: 'Hypertension, controlled with medication',
          allergies: 'Penicillin',
          dental_history: 'Regular checkups, last visit 6 months ago',
          chief_complaint: 'Routine checkup and cleaning',
          treatment_plan: 'Scale and polish, fluoride treatment',
          next_appointment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          total_amount_due: 1200.00
        },
        {
          name: 'Jane',
          surname: 'Smith',
          id_number: '9205126789012',
          date_of_birth: '1992-05-12',
          age: 32,
          gender: 'Female',
          contact_number: '+27 83 234 5678',
          email: 'jane.smith@example.com',
          address: '456 Oak Avenue, Johannesburg, 2000',
          emergency_contact_name: 'Mike Smith',
          emergency_contact_number: '+27 83 876 5432',
          medical_aid_name: 'Bonitas',
          medical_aid_number: 'BON987654321',
          allergies: 'None known',
          dental_history: 'Previous root canal on tooth 16',
          chief_complaint: 'Tooth sensitivity to cold',
          treatment_plan: 'Assessment for possible cavity, fluoride treatment',
          next_appointment: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          total_amount_due: 850.00
        },
        {
          name: 'Michael',
          surname: 'Johnson',
          id_number: '8507089876054',
          date_of_birth: '1985-07-08',
          age: 39,
          gender: 'Male',
          contact_number: '+27 84 345 6789',
          email: 'michael.j@example.com',
          address: '789 Beach Road, Durban, 4001',
          emergency_contact_name: 'Sarah Johnson',
          emergency_contact_number: '+27 84 987 6543',
          medical_aid_name: 'Momentum Health',
          medical_aid_number: 'MOM456789123',
          current_medications: 'Aspirin (daily)',
          medical_history: 'Diabetes Type 2',
          allergies: 'Latex',
          dental_history: 'Multiple fillings, crown on tooth 6',
          chief_complaint: 'Pain in upper left molar',
          treatment_plan: 'X-ray, possible root canal treatment',
          treatment_notes: 'Patient prefers sedation for procedures',
          next_appointment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          total_amount_due: 3500.00
        }
      ];

      for (const patient of patients) {
        try {
          await client.query(`
            INSERT INTO patients (
              tenant_id, name, surname, id_number, date_of_birth, age, gender,
              contact_number, email, address, emergency_contact_name, emergency_contact_number,
              medical_aid_name, medical_aid_number, medical_history, current_medications,
              allergies, dental_history, chief_complaint, treatment_plan, treatment_notes,
              next_appointment, total_amount_due
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
            )
          `, [
            demoUserId, patient.name, patient.surname, patient.id_number, patient.date_of_birth,
            patient.age, patient.gender, patient.contact_number, patient.email, patient.address,
            patient.emergency_contact_name, patient.emergency_contact_number, patient.medical_aid_name,
            patient.medical_aid_number, patient.medical_history, patient.current_medications,
            patient.allergies, patient.dental_history, patient.chief_complaint, patient.treatment_plan,
            patient.treatment_notes, patient.next_appointment, patient.total_amount_due
          ]);
          console.log(`✓ Created patient: ${patient.name} ${patient.surname}`);
        } catch (err) {
          console.log(`⚠️  Patient ${patient.name} ${patient.surname} may already exist`);
        }
      }
    }

    // Verify the setup
    console.log('\n📊 Database Statistics:');
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    const patientsCount = await client.query('SELECT COUNT(*) FROM patients');
    
    console.log(`   Users: ${usersCount.rows[0].count}`);
    console.log(`   Patients: ${patientsCount.rows[0].count}`);

    console.log('\n✅ Database migration completed successfully!');
    console.log('\n🔐 Demo Credentials:');
    console.log('   Email: demo@smilehub.com');
    console.log('   Password: demo123');

  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✓ Database connection closed');
  }
}

migrateDatabase();
