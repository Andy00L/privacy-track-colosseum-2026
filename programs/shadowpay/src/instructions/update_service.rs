use anchor_lang::prelude::*;

use crate::{
    constants::{MAX_DESCRIPTION_LEN, MAX_ENDPOINT_LEN, SERVICE_SEED},
    error::ErrorCode,
    state::ServiceAccount,
};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct UpdateServiceArgs {
    pub service_id: String,
    pub endpoint: String,
    pub price_lamports: u64,
    pub description: String,
    pub active: bool,
}

#[derive(Accounts)]
#[instruction(args: UpdateServiceArgs)]
pub struct UpdateService<'info> {
    #[account(
        mut,
        seeds = [SERVICE_SEED, owner.key().as_ref(), args.service_id.as_bytes()],
        bump = service.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub service: Account<'info, ServiceAccount>,

    pub owner: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateService>, args: UpdateServiceArgs) -> Result<()> {
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

    service.endpoint = args.endpoint;
    service.price_lamports = args.price_lamports;
    service.description = args.description;
    service.active = args.active;

    Ok(())
}
