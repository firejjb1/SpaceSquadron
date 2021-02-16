using System;
using System.ComponentModel.DataAnnotations;

namespace GJServer.Model
{
    public class Player
    {
        public int ID { get; set; }
        public string Name { get; set; }

        public DateTime CreatedDate { get; set; }
        public string IP { get; set; }
        public int Score { get; set; }
    }
}
