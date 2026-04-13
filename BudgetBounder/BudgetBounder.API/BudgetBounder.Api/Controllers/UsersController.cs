using BudgetBounder.Api.Data;
using BudgetBounder.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace BudgetBounder.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly BudgetBounderDbContext _context;

        public UsersController(BudgetBounderDbContext context)
        {
            _context = context;
        }
        [HttpGet]
        public ActionResult<List<User>> GetUsers()
        {
            return _context.Users.ToList();
        }
        [HttpPost]
        public ActionResult<User> CreateUser(User user)
        {
            _context.Users.Add(user);
            _context.SaveChanges();
            return user;
        }
    }
}
