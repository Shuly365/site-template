import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, User } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Trash2, Shield } from 'lucide-react';

export default function Admin() {
  const { user, isLoading, isAdmin, getAllUsers, deleteUser } = useAuth();
  const { deleteUserMessages } = useMessages();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/chat');
    }
  }, [user, isLoading, isAdmin, navigate]);

  const handleDeleteUser = (targetUser: User) => {
    const confirmed = window.confirm(`Delete user "${targetUser.username}" and all their messages?`);
    if (confirmed) {
      deleteUserMessages(targetUser.username);
      deleteUser(targetUser.username);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const users = getAllUsers();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/chat">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Chat
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Panel
            </CardTitle>
            <CardDescription>Manage users and their access to the chat</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.username}>
                    <TableCell className="font-medium">
                      {u.username}
                      {u.username === user.username && (
                        <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          u.role === 'admin'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {(
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteUser(u)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
