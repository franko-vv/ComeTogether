﻿using System;
using System.ComponentModel.DataAnnotations;

namespace ComeTogether.ViewModels
{
    public class ContactViewModel
    {
        [Required]
        [StringLength(255, MinimumLength = 3)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(1024, MinimumLength = 7)]
        public string Message { get; set; }
    }
}
