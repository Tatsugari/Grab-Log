using GrabLog.Models;
namespace GrabLog.Services;
public class AuthService {
  private readonly List<Operator> _ops = new();
  public Operator? Current { get; private set; }
  public bool Register(string name, string email, string pin) {
    if (string.IsNullOrWhiteSpace(name)||string.IsNullOrWhiteSpace(email)||string.IsNullOrWhiteSpace(pin)) return false;
    if (_ops.Any(o => o.Email.Equals(email, StringComparison.OrdinalIgnoreCase))) return false;
    _ops.Add(new Operator { Name=name.Trim(), Email=email.Trim(), Pin=pin });
    return true;
  }
  public bool Login(string email, string pin) {
    var op = _ops.FirstOrDefault(o => o.Email.Equals(email, StringComparison.OrdinalIgnoreCase) && o.Pin==pin);
    if (op==null) {
      var part = email.Split('@')[0].Replace("."," ").Replace("_"," ");
      var name = string.Join(" ", part.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(w => char.ToUpper(w[0])+w[1..].ToLower()));
      op = new Operator { Name=string.IsNullOrWhiteSpace(name)?"Operator":name, Email=email, Pin=pin };
    }
    Current = op;
    return true;
  }
  public string Initials {
    get {
      if (Current==null) return "—";
      var parts = Current.Name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
      return string.Concat(parts.Take(2).Select(p => char.ToUpper(p[0])));
    }
  }
}
