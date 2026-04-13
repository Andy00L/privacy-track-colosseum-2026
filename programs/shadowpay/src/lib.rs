pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use error::*;
pub use instructions::*;
pub use state::*;

declare_id!("85nd28UHwfBzDcA9fRcCFjSGvdvvns7u7yxjcwVjuzpK");

#[program]
pub mod shadowpay {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn register_service(
        ctx: Context<RegisterService>,
        args: RegisterServiceArgs,
    ) -> Result<()> {
        register_service::handler(ctx, args)
    }

    pub fn register_agent(ctx: Context<RegisterAgent>, args: RegisterAgentArgs) -> Result<()> {
        register_agent::handler(ctx, args)
    }

    pub fn update_service(ctx: Context<UpdateService>, args: UpdateServiceArgs) -> Result<()> {
        update_service::handler(ctx, args)
    }

    pub fn deregister_service(
        ctx: Context<DeregisterService>,
        args: DeregisterServiceArgs,
    ) -> Result<()> {
        deregister_service::handler(ctx, args)
    }
}

