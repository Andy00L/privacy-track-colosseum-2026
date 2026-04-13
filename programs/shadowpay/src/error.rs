use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Service ID must not be empty")]
    ServiceIdEmpty,
    #[msg("Service ID exceeds maximum length of 64 characters")]
    ServiceIdTooLong,
    #[msg("Endpoint must not be empty")]
    EndpointEmpty,
    #[msg("Endpoint exceeds maximum length of 256 characters")]
    EndpointTooLong,
    #[msg("Description exceeds maximum length of 256 characters")]
    DescriptionTooLong,
    #[msg("Agent name must not be empty")]
    AgentNameEmpty,
    #[msg("Agent name exceeds maximum length of 64 characters")]
    AgentNameTooLong,
    #[msg("Only the owner can perform this action")]
    Unauthorized,
    #[msg("Service is not active")]
    ServiceInactive,
    #[msg("Price must be greater than zero")]
    InvalidPrice,
}

