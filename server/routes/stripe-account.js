import { Router } from 'express'
import Stripe from 'stripe'
import pool from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('COLOQUE')) {
    throw new Error('Stripe nao configurado. Coloque sua STRIPE_SECRET_KEY no .env')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

// Buscar dados da conta
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM stripe_account WHERE id = 1')
    if (rows.length === 0) return res.json(null)
    const account = rows[0]
    // Nao expor stripe_account_id completo no frontend
    res.json({
      ...account,
      stripe_account_id: account.stripe_account_id ? `...${account.stripe_account_id.slice(-6)}` : null,
      has_stripe_account: !!account.stripe_account_id,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Salvar dados da conta (antes de conectar ao Stripe)
router.put('/', async (req, res) => {
  try {
    const {
      business_name, owner_name, cpf_cnpj, birth_date, email, phone,
      address_line, address_city, address_state, address_postal,
      bank_name, bank_agency, bank_account, bank_account_type
    } = req.body

    await pool.query(
      `UPDATE stripe_account SET
        business_name=?, owner_name=?, cpf_cnpj=?, birth_date=?, email=?, phone=?,
        address_line=?, address_city=?, address_state=?, address_postal=?,
        bank_name=?, bank_agency=?, bank_account=?, bank_account_type=?
      WHERE id = 1`,
      [business_name, owner_name, cpf_cnpj, birth_date, email, phone,
       address_line, address_city, address_state, address_postal,
       bank_name, bank_agency, bank_account, bank_account_type || 'checking']
    )

    res.json({ message: 'Dados salvos com sucesso' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Criar conta conectada no Stripe
router.post('/create', async (req, res) => {
  try {
    const stripe = getStripe()

    const [rows] = await pool.query('SELECT * FROM stripe_account WHERE id = 1')
    if (rows.length === 0) return res.status(400).json({ error: 'Preencha os dados primeiro' })
    const data = rows[0]

    if (!data.owner_name || !data.cpf_cnpj || !data.email) {
      return res.status(400).json({ error: 'Preencha nome, CPF/CNPJ e email antes de conectar' })
    }

    if (!data.bank_agency || !data.bank_account) {
      return res.status(400).json({ error: 'Preencha os dados bancarios antes de conectar' })
    }

    // Se ja tem conta, atualizar em vez de criar
    if (data.stripe_account_id) {
      return res.status(400).json({ error: 'Conta ja conectada. Use o botao de atualizar status.' })
    }

    // Determinar se e CPF ou CNPJ
    const cleanDoc = data.cpf_cnpj.replace(/\D/g, '')
    const isCompany = cleanDoc.length > 11

    // Separar nome e sobrenome
    const nameParts = data.owner_name.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || firstName

    // Parsear data de nascimento
    const dob = data.birth_date ? new Date(data.birth_date) : null

    // Criar conta Custom no Stripe
    const accountParams = {
      type: 'custom',
      country: 'BR',
      email: data.email,
      business_type: isCompany ? 'company' : 'individual',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: req.ip || '127.0.0.1',
      },
    }

    // Dados do individuo
    if (!isCompany) {
      accountParams.individual = {
        first_name: firstName,
        last_name: lastName,
        email: data.email,
        phone: data.phone || undefined,
        id_number: cleanDoc,
        address: {
          line1: data.address_line || 'Endereco nao informado',
          city: data.address_city || 'Cidade',
          state: data.address_state || 'SP',
          postal_code: data.address_postal?.replace(/\D/g, '') || '00000000',
          country: 'BR',
        },
      }
      if (dob) {
        accountParams.individual.dob = {
          day: dob.getUTCDate(),
          month: dob.getUTCMonth() + 1,
          year: dob.getUTCFullYear(),
        }
      }
    } else {
      accountParams.company = {
        name: data.business_name || data.owner_name,
        tax_id: cleanDoc,
        address: {
          line1: data.address_line || 'Endereco nao informado',
          city: data.address_city || 'Cidade',
          state: data.address_state || 'SP',
          postal_code: data.address_postal?.replace(/\D/g, '') || '00000000',
          country: 'BR',
        },
      }
    }

    if (data.business_name) {
      accountParams.business_profile = {
        name: data.business_name,
        mcc: '4722', // Travel agencies
      }
    }

    const account = await stripe.accounts.create(accountParams)

    // Criar conta bancaria externa
    const bankRoutingNumber = `${(data.bank_agency || '').replace(/\D/g, '')}`
    const bankAccountNumber = `${(data.bank_account || '').replace(/\D/g, '')}`

    if (bankRoutingNumber && bankAccountNumber) {
      await stripe.accounts.createExternalAccount(account.id, {
        external_account: {
          object: 'bank_account',
          country: 'BR',
          currency: 'brl',
          routing_number: bankRoutingNumber,
          account_number: bankAccountNumber,
          account_holder_name: data.owner_name,
          account_holder_type: isCompany ? 'company' : 'individual',
        },
      })
    }

    // Salvar no banco
    await pool.query(
      `UPDATE stripe_account SET
        stripe_account_id=?, status='verificando',
        stripe_details_submitted=?, stripe_charges_enabled=?, stripe_payouts_enabled=?
      WHERE id = 1`,
      [account.id, account.details_submitted ? 1 : 0, account.charges_enabled ? 1 : 0, account.payouts_enabled ? 1 : 0]
    )

    res.json({
      message: 'Conta conectada criada com sucesso',
      account_id: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Consultar status atualizado no Stripe
router.get('/status', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT stripe_account_id FROM stripe_account WHERE id = 1')
    if (!rows[0]?.stripe_account_id) {
      return res.json({ status: 'pendente', charges_enabled: false, payouts_enabled: false })
    }

    const stripe = getStripe()
    const account = await stripe.accounts.retrieve(rows[0].stripe_account_id)

    // Determinar status
    let status = 'verificando'
    if (account.charges_enabled && account.payouts_enabled) status = 'ativo'
    else if (account.requirements?.disabled_reason) status = 'restrito'

    // Atualizar no banco
    await pool.query(
      `UPDATE stripe_account SET
        status=?, stripe_details_submitted=?, stripe_charges_enabled=?, stripe_payouts_enabled=?
      WHERE id = 1`,
      [status, account.details_submitted ? 1 : 0, account.charges_enabled ? 1 : 0, account.payouts_enabled ? 1 : 0]
    )

    res.json({
      status,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements: account.requirements?.currently_due || [],
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
