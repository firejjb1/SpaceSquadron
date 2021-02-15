using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using GJServer.Data;

namespace GJServer.Model
{
    public class IndexModel : PageModel
    {
        private readonly GJServer.Data.GJServerContext _context;

        public IndexModel(GJServer.Data.GJServerContext context)
        {
            _context = context;
        }

        public IList<Game> Games { get;set; }

        public async Task OnGetAsync()
        {
            Games = await _context.Game.ToListAsync();
        }
    }
}
