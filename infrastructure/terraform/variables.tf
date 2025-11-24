variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "ami_id" {
  description = "AMI ID for EC2 instance"
  type        = string
  default     = "ami-0c02fb55956c7d316" # Amazon Linux 2
}

variable "key_name" {
  description = "AWS Key Pair name"
  type        = string
}

variable "domain_name" {
  description = "Domain name for Atlantic Proxy"
  type        = string
  default     = "atlanticproxy.com"
}