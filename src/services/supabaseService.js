import supabase from '../lib/supabase';

export const supabaseService = {
  // Auth functions
  async signUp(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          roles: userData.roles || ['client']
        }
      }
    });
    
    if (error) throw error;
    
    // Create user record in the database
    if (data.user) {
      await this.createUserRecord({
        id: data.user.id,
        email: data.user.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone || null
      });
    }
    
    return data;
  },
  
  async createUserRecord(userData) {
    const { error } = await supabase
      .from('users')
      .upsert([userData]);
      
    if (error) throw error;
  },
  
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },
  
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },
  
  async updateUserProfile(updates) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });
    
    if (error) throw error;
    
    // Update user record in the database
    if (data.user) {
      await this.updateUserRecord({
        id: data.user.id,
        first_name: updates.firstName,
        last_name: updates.lastName,
        phone: updates.phone || null
      });
    }
    
    return data;
  },
  
  async updateUserRecord(updates) {
    const { error } = await supabase
      .from('users')
      .update({
        first_name: updates.first_name,
        last_name: updates.last_name,
        phone: updates.phone
      })
      .eq('id', updates.id);
      
    if (error) throw error;
  },

  // File upload functions
  async uploadFile(bucketName, filePath, file) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);
      
    if (error) throw error;
    return data;
  },
  
  async getFileUrl(bucketName, filePath) {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  },
  
  async deleteFile(bucketName, filePath) {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
      
    if (error) throw error;
  },

  // Database functions
  async query(table, options = {}) {
    let query = supabase.from(table).select(options.select || '*');
    
    if (options.eq) {
      Object.entries(options.eq).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    if (options.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending !== false });
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  async insert(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();
      
    if (error) throw error;
    return result;
  },
  
  async update(table, id, data) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return result;
  },
  
  async delete(table, id) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
};