use anchor_lang::prelude::*;

use crate::{
    constants::{AGENT_SEED, MAX_AGENT_NAME_LEN},
    error::ErrorCode,
    state::AgentAccount,
};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RegisterAgentArgs {
    pub name: String,
}

#[derive(Accounts)]
#[instruction(args: RegisterAgentArgs)]
pub struct RegisterAgent<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + AgentAccount::INIT_SPACE,
        seeds = [AGENT_SEED, owner.key().as_ref()],
        bump
    )]
    pub agent: Account<'info, AgentAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RegisterAgent>, args: RegisterAgentArgs) -> Result<()> {
    require!(!args.name.is_empty(), ErrorCode::AgentNameEmpty);
    require!(
        args.name.len() <= MAX_AGENT_NAME_LEN,
        ErrorCode::AgentNameTooLong
    );

    let agent = &mut ctx.accounts.agent;
    let clock = Clock::get()?;

    agent.owner = ctx.accounts.owner.key();
    agent.name = args.name;
    agent.active = true;
    agent.total_payments = 0;
    agent.created_at = clock.unix_timestamp;
    agent.bump = ctx.bumps.agent;

    Ok(())
}
