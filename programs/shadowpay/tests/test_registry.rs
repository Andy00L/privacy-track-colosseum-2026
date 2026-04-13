use anchor_lang::{
    prelude::Pubkey,
    solana_program::instruction::Instruction,
    InstructionData, ToAccountMetas,
};
use litesvm::LiteSVM;
use shadowpay::{
    instruction::{DeregisterService, RegisterAgent, RegisterService, UpdateService},
    DeregisterServiceArgs, RegisterAgentArgs, RegisterServiceArgs, UpdateServiceArgs,
};
use solana_keypair::Keypair;
use solana_message::{Message, VersionedMessage};
use solana_signer::Signer;
use solana_transaction::versioned::VersionedTransaction;

/// Returns the system program ID (all zeros = 11111111111111111111111111111111).
fn system_program_id() -> Pubkey {
    Pubkey::default()
}

const PROGRAM_BYTES: &[u8] = include_bytes!("../../../target/deploy/shadowpay.so");

fn setup_svm() -> (LiteSVM, Keypair) {
    let program_id = shadowpay::id();
    let payer = Keypair::new();
    let mut svm = LiteSVM::new();
    svm.add_program(program_id, PROGRAM_BYTES).unwrap();
    svm.airdrop(&payer.pubkey(), 10_000_000_000).unwrap();
    (svm, payer)
}

fn service_pda(owner: &Pubkey, service_id: &str) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[b"service", owner.as_ref(), service_id.as_bytes()],
        &shadowpay::id(),
    )
}

fn agent_pda(owner: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"agent", owner.as_ref()], &shadowpay::id())
}

fn send_ix(svm: &mut LiteSVM, payer: &Keypair, ix: Instruction) -> Result<(), String> {
    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[ix], Some(&payer.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[payer]).unwrap();
    svm.send_transaction(tx)
        .map(|_| ())
        .map_err(|e| format!("{:?}", e))
}

#[test]
fn test_register_service_success() {
    let (mut svm, payer) = setup_svm();
    let token_mint = Pubkey::new_unique();
    let service_id = "weather-v1".to_string();

    let args = RegisterServiceArgs {
        service_id: service_id.clone(),
        endpoint: "https://example.com/weather".to_string(),
        price_lamports: 1_000_000,
        token_mint,
        description: "Real-time weather data feed".to_string(),
    };

    let (service_pda_key, _bump) = service_pda(&payer.pubkey(), &service_id);

    let accounts = shadowpay::accounts::RegisterService {
        service: service_pda_key,
        owner: payer.pubkey(),
        system_program: system_program_id(),
    }
    .to_account_metas(None);

    let ix = Instruction::new_with_bytes(
        shadowpay::id(),
        &RegisterService { args }.data(),
        accounts,
    );

    let res = send_ix(&mut svm, &payer, ix);
    assert!(res.is_ok(), "register_service failed: {:?}", res.err());

    let account = svm
        .get_account(&service_pda_key)
        .expect("service account not found");
    assert!(account.data.len() > 8, "account data too short");
}

#[test]
fn test_register_agent_success() {
    let (mut svm, payer) = setup_svm();

    let args = RegisterAgentArgs {
        name: "agent-alpha".to_string(),
    };

    let (agent_pda_key, _bump) = agent_pda(&payer.pubkey());

    let accounts = shadowpay::accounts::RegisterAgent {
        agent: agent_pda_key,
        owner: payer.pubkey(),
        system_program: system_program_id(),
    }
    .to_account_metas(None);

    let ix = Instruction::new_with_bytes(
        shadowpay::id(),
        &RegisterAgent { args }.data(),
        accounts,
    );

    let res = send_ix(&mut svm, &payer, ix);
    assert!(res.is_ok(), "register_agent failed: {:?}", res.err());

    let account = svm
        .get_account(&agent_pda_key)
        .expect("agent account not found");
    assert!(account.data.len() > 8, "account data too short");
}

#[test]
fn test_update_service_owner_only() {
    let (mut svm, payer) = setup_svm();
    let token_mint = Pubkey::new_unique();
    let service_id = "price-feed-v1".to_string();

    // First register the service
    let reg_args = RegisterServiceArgs {
        service_id: service_id.clone(),
        endpoint: "https://example.com/prices".to_string(),
        price_lamports: 500_000,
        token_mint,
        description: "Crypto price feeds".to_string(),
    };
    let (service_pda_key, _) = service_pda(&payer.pubkey(), &service_id);

    let reg_accounts = shadowpay::accounts::RegisterService {
        service: service_pda_key,
        owner: payer.pubkey(),
        system_program: system_program_id(),
    }
    .to_account_metas(None);

    let reg_ix = Instruction::new_with_bytes(
        shadowpay::id(),
        &RegisterService { args: reg_args }.data(),
        reg_accounts,
    );
    send_ix(&mut svm, &payer, reg_ix).expect("register should succeed");

    // Now update as owner — should succeed
    let upd_args = UpdateServiceArgs {
        service_id: service_id.clone(),
        endpoint: "https://example.com/prices/v2".to_string(),
        price_lamports: 750_000,
        description: "Crypto price feeds v2".to_string(),
        active: true,
    };

    let upd_accounts = shadowpay::accounts::UpdateService {
        service: service_pda_key,
        owner: payer.pubkey(),
    }
    .to_account_metas(None);

    let upd_ix = Instruction::new_with_bytes(
        shadowpay::id(),
        &UpdateService { args: upd_args }.data(),
        upd_accounts,
    );
    let res = send_ix(&mut svm, &payer, upd_ix);
    assert!(res.is_ok(), "update by owner should succeed: {:?}", res.err());
}

#[test]
fn test_deregister_service_owner_only() {
    let (mut svm, payer) = setup_svm();
    let token_mint = Pubkey::new_unique();
    let service_id = "data-feed-v1".to_string();

    // Register
    let reg_args = RegisterServiceArgs {
        service_id: service_id.clone(),
        endpoint: "https://example.com/data".to_string(),
        price_lamports: 200_000,
        token_mint,
        description: "Data feed service".to_string(),
    };
    let (service_pda_key, _) = service_pda(&payer.pubkey(), &service_id);

    let reg_accounts = shadowpay::accounts::RegisterService {
        service: service_pda_key,
        owner: payer.pubkey(),
        system_program: system_program_id(),
    }
    .to_account_metas(None);

    let reg_ix = Instruction::new_with_bytes(
        shadowpay::id(),
        &RegisterService { args: reg_args }.data(),
        reg_accounts,
    );
    send_ix(&mut svm, &payer, reg_ix).expect("register should succeed");

    // Deregister as owner — should succeed
    let dereg_args = DeregisterServiceArgs {
        service_id: service_id.clone(),
    };
    let dereg_accounts = shadowpay::accounts::DeregisterService {
        service: service_pda_key,
        owner: payer.pubkey(),
    }
    .to_account_metas(None);

    let dereg_ix = Instruction::new_with_bytes(
        shadowpay::id(),
        &DeregisterService { args: dereg_args }.data(),
        dereg_accounts,
    );
    let res = send_ix(&mut svm, &payer, dereg_ix);
    assert!(
        res.is_ok(),
        "deregister by owner should succeed: {:?}",
        res.err()
    );
}

#[test]
fn test_update_service_wrong_owner_fails() {
    let (mut svm, payer) = setup_svm();
    let token_mint = Pubkey::new_unique();
    let service_id = "nft-meta-v1".to_string();

    // Register with payer
    let reg_args = RegisterServiceArgs {
        service_id: service_id.clone(),
        endpoint: "https://example.com/nft".to_string(),
        price_lamports: 100_000,
        token_mint,
        description: "NFT metadata service".to_string(),
    };
    let (service_pda_key, _) = service_pda(&payer.pubkey(), &service_id);

    let reg_accounts = shadowpay::accounts::RegisterService {
        service: service_pda_key,
        owner: payer.pubkey(),
        system_program: system_program_id(),
    }
    .to_account_metas(None);

    let reg_ix = Instruction::new_with_bytes(
        shadowpay::id(),
        &RegisterService { args: reg_args }.data(),
        reg_accounts,
    );
    send_ix(&mut svm, &payer, reg_ix).expect("register should succeed");

    // Attempt update with a different signer (attacker)
    let attacker = Keypair::new();
    svm.airdrop(&attacker.pubkey(), 5_000_000_000).unwrap();

    // The PDA is derived from payer's key, so attacker cannot sign for it.
    // Attacker can't even form a valid PDA with their own key since the service was
    // registered by payer. We test that the has_one constraint rejects the mismatch.
    //
    // To trigger has_one, we need the correct PDA but the wrong signer.
    // The update ix uses owner as a Signer — if we pass attacker as signer,
    // the has_one = owner check will fail because service.owner == payer.pubkey() != attacker.
    let upd_args = UpdateServiceArgs {
        service_id: service_id.clone(),
        endpoint: "https://attacker.com".to_string(),
        price_lamports: 1,
        description: "Hijacked".to_string(),
        active: false,
    };

    // Build accounts with attacker as owner signer but correct service PDA
    let mut upd_accounts = shadowpay::accounts::UpdateService {
        service: service_pda_key,
        owner: attacker.pubkey(),
    }
    .to_account_metas(None);

    // Mark owner as writable/signer manually (to_account_metas may not set signer correctly)
    upd_accounts[1].is_signer = true;

    let upd_ix = Instruction::new_with_bytes(
        shadowpay::id(),
        &UpdateService { args: upd_args }.data(),
        upd_accounts,
    );

    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[upd_ix], Some(&attacker.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[&attacker]).unwrap();
    let res = svm.send_transaction(tx);

    assert!(
        res.is_err(),
        "update with wrong owner should fail, but succeeded"
    );
}

#[test]
fn test_register_service_empty_service_id_fails() {
    let (mut svm, payer) = setup_svm();
    let token_mint = Pubkey::new_unique();
    // Empty service_id — instruction handler should reject it.
    // However, PDA derivation with empty bytes will produce a valid PDA,
    // so the constraint won't fail — the handler validation will.
    let args = RegisterServiceArgs {
        service_id: String::new(),
        endpoint: "https://example.com/service".to_string(),
        price_lamports: 1_000_000,
        token_mint,
        description: "Test".to_string(),
    };
    let (service_pda_key, _) = service_pda(&payer.pubkey(), "");

    let accounts = shadowpay::accounts::RegisterService {
        service: service_pda_key,
        owner: payer.pubkey(),
        system_program: system_program_id(),
    }
    .to_account_metas(None);

    let ix = Instruction::new_with_bytes(
        shadowpay::id(),
        &RegisterService { args }.data(),
        accounts,
    );

    let res = send_ix(&mut svm, &payer, ix);
    assert!(
        res.is_err(),
        "empty service_id should be rejected, but succeeded"
    );
}

#[test]
fn test_register_service_zero_price_fails() {
    let (mut svm, payer) = setup_svm();
    let token_mint = Pubkey::new_unique();

    let args = RegisterServiceArgs {
        service_id: "test-zero-price".to_string(),
        endpoint: "https://example.com/service".to_string(),
        price_lamports: 0,
        token_mint,
        description: "Zero price test".to_string(),
    };
    let (service_pda_key, _) = service_pda(&payer.pubkey(), "test-zero-price");

    let accounts = shadowpay::accounts::RegisterService {
        service: service_pda_key,
        owner: payer.pubkey(),
        system_program: system_program_id(),
    }
    .to_account_metas(None);

    let ix = Instruction::new_with_bytes(
        shadowpay::id(),
        &RegisterService { args }.data(),
        accounts,
    );

    let res = send_ix(&mut svm, &payer, ix);
    assert!(
        res.is_err(),
        "zero price should be rejected, but succeeded"
    );
}
