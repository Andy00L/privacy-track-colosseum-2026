use anchor_lang::prelude::*;

use crate::{
    constants::SERVICE_SEED,
    error::ErrorCode,
    state::ServiceAccount,
};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct DeregisterServiceArgs {
    pub service_id: String,
}

#[derive(Accounts)]
#[instruction(args: DeregisterServiceArgs)]
pub struct DeregisterService<'info> {
    #[account(
        mut,
        seeds = [SERVICE_SEED, owner.key().as_ref(), args.service_id.as_bytes()],
        bump = service.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub service: Account<'info, ServiceAccount>,

    pub owner: Signer<'info>,
}

pub fn handler(ctx: Context<DeregisterService>, _args: DeregisterServiceArgs) -> Result<()> {
    let service = &mut ctx.accounts.service;
    service.active = false;
    Ok(())
}
