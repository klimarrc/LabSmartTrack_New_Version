using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LabSmartTrack.Api.Data;
using LabSmartTrack.Api.Models;

namespace LabSmartTrack.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RacksController : ControllerBase
    {
        private readonly LabSmartTrackDbContext _context;

        public RacksController(LabSmartTrackDbContext context)
        {
            _context = context;
        }

        // GET: api/Racks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Rack>>> GetRacks()
        {
            return await _context.Racks.ToListAsync();
        }

        // GET: api/Racks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Rack>> GetRack(int id)
        {
            var rack = await _context.Racks.FindAsync(id);

            if (rack == null)
            {
                return NotFound();
            }

            return rack;
        }

        // PUT: api/Racks/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRack(int id, Rack rack)
        {
            if (id != rack.Id)
            {
                return BadRequest();
            }

            _context.Entry(rack).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RackExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Racks
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Rack>> PostRack(Rack rack)
        {
            _context.Racks.Add(rack);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRack", new { id = rack.Id }, rack);
        }

        // DELETE: api/Racks/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRack(int id)
        {
            var rack = await _context.Racks.FindAsync(id);
            if (rack == null)
            {
                return NotFound();
            }

            _context.Racks.Remove(rack);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RackExists(int id)
        {
            return _context.Racks.Any(e => e.Id == id);
        }
    }
}
