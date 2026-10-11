using GrabLog.Models;
namespace GrabLog.Services;
public class ToolService {
  private readonly List<Tool> _tools = new() {
    new() { Id="TD-001", Name="Pliers", Icon="🔧", Status="available", Location="Locker A-12" },
    new() { Id="TD-002", Name="Screwdriver", Icon="🪛", Status="inuse", Location="Locker B-04", LoggedTo="Alex" },
    new() { Id="TD-003", Name="Hammer", Icon="🔨", Status="overdue", Location="Locker A-03", LoggedTo="Marcus" },
    new() { Id="TD-004", Name="Flat Screwdriver", Icon="🪛", Status="disposed", Location="Disposal Bin" }
  };
  public IReadOnlyList<Tool> GetAll() => _tools;
  public IEnumerable<Tool> Filter(string f) => f switch {
    "available" => _tools.Where(t => t.Status=="available"),
    "inuse" => _tools.Where(t => t.Status=="inuse"),
    "overdue" => _tools.Where(t => t.Status=="overdue"),
    _ => _tools
  };
  public int CountByStatus(string s) => _tools.Count(t => t.Status==s);
  public void Borrow(string id, string op) {
    var t = _tools.FirstOrDefault(x => x.Id==id);
    if (t==null || t.Status!="available") return;
    t.Status="inuse"; t.LoggedTo = op.Split(' ').FirstOrDefault() ?? op;
  }
  public void Return(string id) {
    var t = _tools.FirstOrDefault(x => x.Id==id);
    if (t==null) return;
    t.Status="available"; t.LoggedTo=null;
  }
  public void SetStatus(string id, string status) {
    var t = _tools.FirstOrDefault(x => x.Id==id);
    if (t==null) return;
    t.Status=status;
    if (status is "available" or "disposed") t.LoggedTo=null;
    if (status=="disposed") t.Location="Disposal Bin";
  }
  public void Dispose(string id) => SetStatus(id, "disposed");
}
