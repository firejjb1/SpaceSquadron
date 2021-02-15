using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using GJServer.Model;

namespace GJServer.Data
{
    public class GJServerContext : DbContext
    {
        public GJServerContext (DbContextOptions<GJServerContext> options)
            : base(options)
        {
        }

        public DbSet<GJServer.Model.Game> Game { get; set; }
    }
}
