terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "atlantic_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "atlantic-proxy-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "atlantic_igw" {
  vpc_id = aws_vpc.atlantic_vpc.id

  tags = {
    Name = "atlantic-proxy-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public_subnet_1" {
  vpc_id                  = aws_vpc.atlantic_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "atlantic-public-1"
  }
}

# Security Group
resource "aws_security_group" "atlantic_sg" {
  name_prefix = "atlantic-proxy-"
  vpc_id      = aws_vpc.atlantic_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 Instance
resource "aws_instance" "atlantic_server" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name              = var.key_name
  vpc_security_group_ids = [aws_security_group.atlantic_sg.id]
  subnet_id             = aws_subnet.public_subnet_1.id

  user_data = file("${path.module}/user_data.sh")

  tags = {
    Name = "atlantic-proxy-server"
  }
}