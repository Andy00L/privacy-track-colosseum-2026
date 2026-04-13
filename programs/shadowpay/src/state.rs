use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ServiceAccount {
    pub owner: Pubkey,
    #[max_len(64)]
    pub service_id: String,
    #[max_len(256)]
    pub endpoint: String,
    pub price_lamports: u64,
    pub token_mint: Pubkey,
    #[max_len(256)]
    pub description: String,
    pub active: bool,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct AgentAccount {
    pub owner: Pubkey,
    #[max_len(64)]
    pub name: String,
    pub active: bool,
    pub total_payments: u64,
    pub created_at: i64,
    pub bump: u8,
}
