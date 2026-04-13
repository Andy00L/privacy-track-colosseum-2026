use anchor_lang::prelude::*;

use crate::{
    constants::{MAX_DESCRIPTION_LEN, MAX_ENDPOINT_LEN, MAX_SERVICE_ID_LEN, SERVICE_SEED},
    error::ErrorCode,
    state::ServiceAccount,
};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RegisterServiceArgs {
    pub service_id: String,
    pub endpoint: String,
    pub price_lamports: u64,
    pub token_mint: Pubkey,
    pub description: String,
}

#[derive(Accounts)]
#[instruction(args: RegisterServiceArgs)]
pub struct RegisterService<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + ServiceAccount::INIT_SPACE,
        seeds = [SERVICE_SEED, owner.key().as_ref(), args.service_id.as_bytes()],
        bump
    )]
    pub service: Account<'info, ServiceAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RegisterService>, args: RegisterServiceArgs) -> Result<()> {
    require!(!args.service_id.is_empty(), ErrorCode::ServiceIdEmpty);
    require!(
        args.service_id.len() <= MAX_SERVICE_ID_LEN,
        ErrorCode::ServiceIdTooLong
    );
    require!(!args.endpoint.is_empty(), ErrorCode::EndpointEmpty);
    require!(
        args.endpoint.len() <= MAX_ENDPOINT_LEN,
        ErrorCode::EndpointTooLong
    );
    require!(
        args.description.len() <= MAX_DESCRIPTION_LEN,
        ErrorCode::DescriptionTooLong
    );
    require!(args.price_lamports > 0, ErrorCode::InvalidPrice);

    let service = &mut ctx.accounts.service;
    let clock = Clock::get()?;

    service.owner = ctx.accounts.owner.key();
    service.service_id = args.service_id;
    service.endpoint = args.endpoint;
    service.price_lamports = args.price_lamports;
    service.token_mint = args.token_mint;
    service.description = args.description;
    service.active = true;
    service.created_at = clock.unix_timestamp;
    service.bump = ctx.bumps.service;

    Ok(())
}
